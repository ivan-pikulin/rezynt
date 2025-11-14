# Simplified Analysis Implementation Plan

## Overview
Simplify resume analysis to run all rules in parallel as a single step. Users are redirected to the refine page immediately after parsing and see a loading animation until analysis completes. NO incremental updates - just one final result.

## Task Status Architecture

### Parsing Task (`process_resume_upload_task`) Statuses
The Celery task uses `task.update_state()` to report progress to StartPage:
- **`PARSING`** - File is being parsed (OCR, text extraction)
- **`ANALYZING`** - Resume is being analyzed (rules execution)
- **`SUCCESS`** - Both parsing and analysis completed successfully
- **`FAILURE`** - Error occurred during parsing or analysis

Frontend on StartPage polls the task status and redirects to `/refine?analyzing=true` when status becomes `ANALYZING`, or to `/refine` when status is `SUCCESS`.

### Single Source of Truth: Celery Task State
Frontend uses ONLY the Celery task state for all status tracking. No separate `analysis_result.status` field needed.
- StartPage polls Celery task state: `PARSING` → `ANALYZING` → `SUCCESS`/`FAILURE`
- RefinePage checks if analysis exists in `analysis_result` (if empty, show "Run Analysis" button)
- When analysis completes, full result is saved to `analysis_result` JSONB field

## Key Principles
- ✅ Keep parallel rule execution via `asyncio.gather()`
- ✅ Use existing `analysis_result` JSONB field (no separate table, no status tracking)
- ✅ Celery task reports status: `PARSING` → `ANALYZING` → `SUCCESS`/`FAILURE`
- ✅ Frontend polls Celery task state (single source of truth)
- ✅ Frontend shows loading placeholders during analysis
- ✅ Use MUI Skeleton components for loading states
- ✅ Use custom `usePolling` hook to avoid code duplication
- ❌ NO incremental updates - wait for all rules to finish
- ❌ NO WebSocket events - simple polling only
- ❌ NO query parameters - status determined by API only

---

## Phase 1: Backend - Add Task Status Updates

### Commit 1: Modify Resume Upload Task
**Files:** `backend/app/core/tasks.py`

**Changes:**
- [ ] Add `bind=True` to task decorator to get task instance
- [ ] Update task state to `PARSING` at start (with `meta.message`)
- [ ] Update task state to `ANALYZING` before analysis begins (with `meta.message`)
- [ ] Run all rules in parallel (existing `asyncio.gather()`)
- [ ] Save complete analysis result once at the end (no status field needed)
- [ ] Return final status: `SUCCESS` or `FAILURE`

**Code:**
```python
@celery_app.task(name="process_resume_upload_task", bind=True)
def process_resume_upload_task(self, file_content: bytes, filename: str, user_id: int):
    """Process uploaded resume using ParseService"""
    return async_to_sync(_process_resume_upload_task)(self, file_content, filename, user_id)


async def _process_resume_upload_task(task, file_content: bytes, filename: str, user_id: int):
    """Async implementation of resume processing task"""
    logger.info(f"Starting resume processing task for user {user_id}, filename: {filename}")

    temp_file_path = None
    parse_service = None

    try:
        # ✅ Update Celery task state to PARSING
        task.update_state(
            state='PARSING',
            meta={'status': 'parsing', 'message': 'Parsing resume file...', 'user_id': user_id}
        )

        # [... existing parsing code ...]
        # Validate file, save to temp, parse with ParseService
        parsed_data = await parse_service.parse_resume_file(temp_file_path)

        # Update user's resume_data with parsed data
        await _update_user_resume_data(user_id, parsed_data)
        logger.info(f"✅ Parsing completed for user {user_id}")

        # ✅ Update Celery task state to ANALYZING
        task.update_state(
            state='ANALYZING',
            meta={'status': 'analyzing', 'message': 'Analyzing resume...', 'user_id': user_id}
        )

        # ✅ Trigger analysis (with status tracking)
        await _generate_analysis_after_upload(user_id)

        # Clean up and return success
        logger.info(f"✅ Resume processing completed for user {user_id}")
        return {
            'status': 'success',
            'user_id': user_id,
            'message': 'Resume processed and analyzed successfully'
        }

    except Exception as e:
        logger.error(f"❌ Exception in process_resume_upload task: {e}", exc_info=True)
        # [... cleanup code ...]
        return {
            'status': 'error',
            'error': str(e),
            'user_id': user_id,
            'message': f'Task failed: {str(e)}'
        }


async def _generate_analysis_after_upload(user_id: int):
    """Generates analysis for uploaded resume (no status tracking)"""
    from app.database.session import SessionLocal
    from app.database.crud.crud_user import user_crud
    from app.services.analysis.analysis_service import analysis_service
    from datetime import datetime

    logger.info(f"🔍 Starting analysis for user {user_id}")

    async with SessionLocal() as db:
        # Get user and resume data
        user = await user_crud.get(db, user_id)
        if not user:
            logger.warning(f"User {user_id} not found")
            raise ValueError(f"User {user_id} not found")

        resume_data = await user_crud.get_resume_data(db, user_id=user_id)
        if not resume_data:
            logger.warning(f"No resume data for user {user_id}")
            raise ValueError(f"No resume data for user {user_id}")

        # ✅ Run complete analysis (all rules in parallel)
        analysis_result = await analysis_service.analyze_resume(
            resume_data,
            is_premium=user.is_premium
        )

        # ✅ Save complete result (no status field)
        analysis_data = analysis_result.model_dump(mode='json')

        await user_crud.update(
            db,
            db_obj_id=user_id,
            obj_in={
                'analysis_result': analysis_data,
                'analysis_generated_at': datetime.utcnow()
            }
        )

        logger.info(f"✅ Analysis completed for user {user_id}. Score: {analysis_result.score}")
```

**Testing:**
- [ ] Celery task state updates: `PARSING` → `ANALYZING` → `SUCCESS`
- [ ] Error handling sets Celery state to `FAILURE` with error in `meta`
- [ ] `task.meta.message` shows current operation (parsing/analyzing)
- [ ] StartPage receives task status updates via polling

---

## Phase 2: Frontend - Create Polling Hook

### Commit 2: Add usePolling Hook
**Files:** `frontend/src/shared/hooks/usePolling.ts`

**Changes:**
- [ ] Create reusable polling hook with cleanup
- [ ] Accepts fetch function, stop condition, and interval

**Code:**
```typescript
import { useState, useEffect, useRef } from 'react';

type UsePollingOptions<T> = {
  fetchFn: () => Promise<T>;
  shouldStop: (data: T) => boolean;
  interval?: number;
  enabled?: boolean;
};

export function usePolling<T>({
  fetchFn,
  shouldStop,
  interval = 3000,
  enabled = true,
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !isPolling) return;

    const poll = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);

        if (shouldStop(result)) {
          setIsPolling(false);
          return;
        }

        // Schedule next poll
        timeoutRef.current = setTimeout(poll, interval);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Polling failed'));
        // Retry with longer delay on error
        timeoutRef.current = setTimeout(poll, interval * 2);
      }
    };

    poll();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isPolling, fetchFn, shouldStop, interval]);

  return { data, error, isPolling };
}
```

**Testing:**
- [ ] TypeScript compiles
- [ ] Cleanup works on unmount
- [ ] Polling stops when shouldStop returns true

---

## Phase 3: Frontend - Modify StartPage Upload Flow

### Commit 3: Redirect to Refine When Analysis Starts
**Files:** `frontend/src/features/start/StartPage.tsx`

**Changes:**
- [ ] Use `usePolling` hook for task status
- [ ] Show appropriate message for `PARSING` vs `ANALYZING` states
- [ ] Redirect to `/refine` when state becomes `ANALYZING` or `SUCCESS`
- [ ] No query parameters needed

**Code:**
```typescript
import { usePolling } from 'shared/hooks/usePolling';

// Use polling hook
const { data: taskResult } = usePolling({
  fetchFn: () => resumeApi.getUploadResult(taskIdParam),
  shouldStop: (result) =>
    result.state === 'ANALYZING' ||
    result.state === 'SUCCESS' ||
    result.state === 'FAILURE',
  interval: 2000,
  enabled: !!taskIdParam && isProcessingUpload,
});

// React to task state changes
useEffect(() => {
  if (!taskResult) return;

  if (taskResult.state === 'PARSING') {
    // Show parsing message
    setUploadMessage(taskResult.meta?.message || t('start.parsingResume'));
  } else if (taskResult.state === 'ANALYZING' || taskResult.state === 'SUCCESS') {
    // ✅ Redirect to refine (no query param)
    setIsProcessingUpload(false);
    setUploadError(null);

    if (user && !user.has_completed_onboarding) {
      navigate('/onboarding?redirect=/refine', { replace: true });
    } else {
      navigate('/refine', { replace: true });
    }
  } else if (taskResult.state === 'FAILURE') {
    // Handle error
    setIsProcessingUpload(false);
    setUploadError(taskResult.meta?.error || t('errors.uploadFailed'));
  }
}, [taskResult]);
```

**Testing:**
- [ ] Shows "Parsing resume..." message during PARSING state
- [ ] Redirects to `/refine` when state becomes ANALYZING or SUCCESS
- [ ] Error handling shows error message from task metadata
- [ ] Polling interval is 2 seconds
- [ ] Cleanup works on unmount

---

## Phase 4: Frontend - Add Loading State to RefinePage

### Commit 4: Check Analysis Existence on RefinePage
**Files:** `frontend/src/features/refine/RefinePage.tsx`

**Changes:**
- [ ] Check if `analysis_result` exists on page load
- [ ] Show loading state if analysis is empty (user just uploaded)
- [ ] Poll analysis endpoint until data appears
- [ ] Use `usePolling` hook for consistency

**Code:**
```typescript
import { usePolling } from 'shared/hooks/usePolling';

const [analysis, setAnalysis] = useState<any>(null);
const [isLoadingInitial, setIsLoadingInitial] = useState(true);

// Check if analysis exists on mount
useEffect(() => {
  const loadAnalysis = async () => {
    try {
      const data = await analysisApi.getAnalysis();

      if (data && Object.keys(data).length > 0) {
        // Analysis exists
        setAnalysis(data);
        setIsLoadingInitial(false);
      } else {
        // No analysis yet - user just uploaded, show loading
        setIsLoadingInitial(false);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      setIsLoadingInitial(false);
    }
  };

  loadAnalysis();
}, []);

// Poll for analysis if empty
const isAnalyzing = !analysis || Object.keys(analysis).length === 0;

const { data: polledAnalysis } = usePolling({
  fetchFn: () => analysisApi.getAnalysis(),
  shouldStop: (data) => data && Object.keys(data).length > 0,
  interval: 3000,
  enabled: isAnalyzing && !isLoadingInitial,
});

// Update analysis when polling returns data
useEffect(() => {
  if (polledAnalysis && Object.keys(polledAnalysis).length > 0) {
    setAnalysis(polledAnalysis);
  }
}, [polledAnalysis]);

// Pass isAnalyzing to child components
<ScoreBar
  score={analysis?.score || 0}
  label={analysis?.label || ''}
  subtitle={analysis?.subtitle || ''}
  isAnalyzing={isAnalyzing && !isLoadingInitial}
  // ... other props
/>

<ImprovementSections
  sections={analysis?.sections || []}
  isAnalyzing={isAnalyzing && !isLoadingInitial}
  // ... other props
/>
```

**Testing:**
- [ ] Shows loading state when analysis is empty (just after upload)
- [ ] Polling starts automatically
- [ ] Polling stops when analysis data appears
- [ ] Error handling works
- [ ] Cleanup works on unmount

---

## Phase 5: Frontend - Update ScoreBar Component

### Commit 5: Add Loading State to ScoreBar
**Files:** `frontend/src/features/refine/components/ScoreBar.tsx`

**Changes:**
- [ ] Accept `isAnalyzing` prop
- [ ] Show spinner instead of score when analyzing

**Code:**
```typescript
type Props = {
  score: number;
  label: string;
  subtitle: string;
  marketingText: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isPremium?: boolean;
  onUpgrade?: () => void;
  isAnalyzing?: boolean;  // ✅ NEW
};

const ScoreBar: React.FC<Props> = ({
  score,
  label,
  subtitle,
  marketingText,
  onRefresh,
  isRefreshing,
  isPremium,
  onUpgrade,
  isAnalyzing = false,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={scoreContainer}>
      {isAnalyzing ? (
        // ✅ Loading state
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#6b7280' }}>
            {t('refine.analyzingResume')}
          </Typography>
        </Box>
      ) : (
        // ✅ Normal score display
        <>
          <Box sx={scoreCircleContainer}>
            <Box sx={scoreCircle(score)}>
              <Typography sx={scoreText}>{score}</Typography>
            </Box>
          </Box>

          <Typography sx={scoreLabel}>{label}</Typography>
          <Typography sx={scoreSubtitle}>{subtitle}</Typography>

          {/* ... rest of component */}
        </>
      )}
    </Box>
  );
};
```

**i18n Addition:**
Add to `frontend/src/shared/i18n/en.json`:
```json
{
  "refine": {
    "analyzingResume": "Analyzing your resume..."
  }
}
```

**Testing:**
- [ ] Spinner shows when isAnalyzing=true
- [ ] Score shows when isAnalyzing=false
- [ ] Translation works

---

## Phase 6: Frontend - Update ImprovementSections Component

### Commit 6: Add Loading Placeholders to Sections
**Files:** `frontend/src/features/refine/components/ImprovementSections.tsx`

**Changes:**
- [ ] Accept `isAnalyzing` prop
- [ ] Use MUI Skeleton components for loading state
- [ ] Show real sections when analysis complete

**Code:**
```typescript
import { Skeleton, Stack } from '@mui/material';

type Props = {
  sections: any[];
  resume: any;
  onFixApplied: (pointId: string, data: any) => void;
  onNavigateToField: (field: string) => void;
  onFixMarked: (pointId: string) => void;
  dismissedPointIds?: Set<string>;
  isPremium?: boolean;
  isAnalyzing?: boolean;  // ✅ NEW
};

const ImprovementSections: React.FC<Props> = ({
  sections,
  resume,
  onFixApplied,
  onNavigateToField,
  onFixMarked,
  dismissedPointIds,
  isPremium = false,
  isAnalyzing = false,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ pt: 1, px: 2, pb: 2, overflow: 'auto' }}>
      {isAnalyzing ? (
        // ✅ Show 3 skeleton placeholders (MUI Skeleton)
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={120}
              animation="wave"
              sx={{ borderRadius: '12px' }}
            />
          ))}
        </Stack>
      ) : (
        // ✅ Show real sections
        sections.map((section) => (
          <Accordion
            key={section.id}
            defaultExpanded
            sx={accordionSx}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#6b7280' }}>
                    ({section.improvement_points?.length || 0} issues)
                  </Typography>
                </Box>
                {/* Progress bar */}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              {section.improvement_points?.length > 0 ? (
                section.improvement_points.map((point: any) => (
                  <ImprovementPoint
                    key={point.id}
                    point={point}
                    resume={resume}
                    onFixApplied={onFixApplied}
                    onNavigateToField={onNavigateToField}
                    onFixMarked={onFixMarked}
                    isDismissed={dismissedPointIds?.has(point.id) || false}
                    isPremium={isPremium}
                  />
                ))
              ) : (
                <Typography sx={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', p: 2 }}>
                  No issues found. Great job!
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};
```

**Testing:**
- [ ] 3 skeleton placeholders show when analyzing
- [ ] Skeleton has wave animation (built-in MUI)
- [ ] Real sections show after analysis completes

---

## Phase 7: Testing & Refinement

### Testing Checklist

- [ ] **Upload Resume Flow:**
  - [ ] Upload PDF/DOCX file on StartPage
  - [ ] See parsing animation
  - [ ] Redirect to RefinePage immediately after parsing
  - [ ] See loading state on RefinePage (spinner + placeholders)

- [ ] **Analysis Loading State:**
  - [ ] ScoreBar shows spinner with "Analyzing..." text
  - [ ] 3 placeholder section cards visible
  - [ ] Placeholder cards pulsate (fade in/out)

- [ ] **Analysis Completion:**
  - [ ] Loading state disappears
  - [ ] Real score appears
  - [ ] Real improvement sections appear
  - [ ] All improvement points visible

- [ ] **Error Handling:**
  - [ ] Upload error shows correctly
  - [ ] Analysis failure shows error message
  - [ ] Can retry after error

- [ ] **Backward Compatibility:**
  - [ ] Existing users with completed analysis see results immediately
  - [ ] Refresh analysis button works
  - [ ] Mark as fixed functionality intact

---

## Phase 8: Documentation

### Commit 7: Update Documentation
**Files to update:**

1. **CLAUDE.md**
   - [ ] Document simplified analysis flow
   - [ ] Document Celery task states (PARSING → ANALYZING → SUCCESS)
   - [ ] Remove mentions of incremental updates
   - [ ] Document `usePolling` hook

2. **spec.xml files:**
   - [ ] `backend/app/services/analysis/spec.xml`
   - [ ] `backend/app/core/spec.xml`
   - [ ] `frontend/src/features/refine/spec.xml`

---

## Deployment Checklist

- [ ] No TypeScript errors
- [ ] Backend imports successfully
- [ ] Frontend builds successfully
- [ ] Test upload → parse → analyze flow locally
- [ ] Test on staging environment
- [ ] Monitor Celery worker logs
- [ ] Deploy to production
- [ ] Monitor error logs for 24 hours

---

## Rollback Plan

If issues occur in production:

1. **Revert code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Reset analysis status for all users:**
   ```sql
   UPDATE users SET analysis_result = jsonb_set(
     COALESCE(analysis_result, '{}'::jsonb),
     '{status}',
     '"none"'
   );
   ```

---

## Success Metrics

After deployment:

- [ ] Average time from upload to refine page
- [ ] Analysis completion rate
- [ ] Error rate
- [ ] User engagement with loading state
- [ ] User feedback

---

## Notes

- Much simpler than incremental approach
- Better UX: users see clean loading state, then complete results
- Easier to maintain: no complex state synchronization
- Could add WebSocket later if polling is too slow
- Analysis typically takes 5-15 seconds, polling is acceptable
