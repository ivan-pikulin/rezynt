# Progressive Analysis Implementation Plan

## Overview
Implement progressive resume analysis where users can immediately access the refine page after parsing completes, while improvement points load incrementally as analysis rules finish (running in parallel).

## Key Principles
- ✅ Keep parallel rule execution via `asyncio.gather()`
- ✅ Use existing `analysis_result` JSONB field (no separate table)
- ✅ Incremental updates as each rule completes
- ✅ User can edit resume while analysis runs

---

## Phase 1: Backend - CRUD Operations

### Commit 1: Add Analysis CRUD Methods
**Files:** `backend/app/database/crud/crud_user.py`

**Changes:**
- [ ] Add `init_analysis()` method - initialize empty analysis structure
- [ ] Add `add_improvement_points_incremental()` method - add points with row-level lock to prevent race conditions
- [ ] Add `mark_analysis_complete()` method - add final scores WITHOUT overwriting points
- [ ] Add `get_analysis_status()` method - poll current status

**Code:**
```python
async def init_analysis(
    self,
    db: AsyncSession,
    user_id: int
) -> None:
    """Initialize analysis with empty sections"""
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(
            analysis_result={
                'status': 'analyzing',
                'sections': [
                    {'id': 'content', 'title': 'Content & Structure', 'improvement_points': []},
                    {'id': 'ats', 'title': 'ATS Optimization', 'improvement_points': []},
                    {'id': 'style', 'title': 'Style & Grammar', 'improvement_points': []}
                ]
            }
        )
    )
    await db.execute(stmt)
    await db.commit()

async def add_improvement_points_incremental(
    self,
    db: AsyncSession,
    user_id: int,
    points: List[dict]
) -> None:
    """Add improvement points to analysis_result incrementally (ONE DB UPDATE with row lock)"""
    # Get current analysis_result with row-level lock to prevent race conditions
    result = await db.execute(
        select(User).where(User.id == user_id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        return

    analysis = user.analysis_result or {
        'status': 'analyzing',
        'sections': [
            {'id': 'content', 'title': 'Content & Structure', 'improvement_points': []},
            {'id': 'ats', 'title': 'ATS Optimization', 'improvement_points': []},
            {'id': 'style', 'title': 'Style & Grammar', 'improvement_points': []}
        ]
    }

    # Add points to corresponding sections
    for point in points:
        section_id = point.get('section_id')
        section = next((s for s in analysis['sections'] if s['id'] == section_id), None)
        if section:
            section['improvement_points'].append(point)

    # Update user object (will be saved on commit due to ORM tracking)
    user.analysis_result = analysis
    await db.commit()

async def mark_analysis_complete(
    self,
    db: AsyncSession,
    user_id: int,
    score: int,
    label: str,
    subtitle: str,
    total_improvements: int,
    potential_score: int
) -> None:
    """Mark analysis as complete - only add scores, keep existing points"""
    # Get current analysis_result with lock
    result = await db.execute(
        select(User).where(User.id == user_id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        return

    # Get existing analysis with points
    analysis = user.analysis_result or {'sections': []}

    # Add final scores to existing analysis (don't overwrite points!)
    analysis['status'] = 'completed'
    analysis['score'] = score
    analysis['label'] = label
    analysis['subtitle'] = subtitle
    analysis['total_improvements'] = total_improvements
    analysis['potential_score'] = potential_score
    analysis['generated_at'] = datetime.utcnow().isoformat()

    # Update
    user.analysis_result = analysis
    user.analysis_generated_at = func.now()
    await db.commit()

async def get_analysis_status(
    self,
    db: AsyncSession,
    user_id: int
) -> dict:
    """Get current analysis status (for polling)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return None

    analysis_result = user.analysis_result or {'status': 'none'}

    return {
        'status': analysis_result.get('status', 'none'),
        'analysis_result': user.analysis_result
    }
```

**Testing:**
- [ ] Import without errors
- [ ] Methods follow existing CRUD patterns

---

## Phase 2: Backend - Analysis Service

### Commit 2: Add Incremental Analysis Method
**Files:** `backend/app/services/analysis/analysis_service.py`

**Changes:**
- [ ] Add `analyze_resume_incremental()` method
- [ ] Keep existing `analyze_resume()` unchanged (for backward compatibility)
- [ ] Parallel execution with incremental callbacks

**Code:**
```python
async def analyze_resume_incremental(
    self,
    resume: dict,
    user_id: int,
    db: AsyncSession,
    is_premium: bool = False
) -> None:
    """
    Analyze resume with incremental updates.
    Runs all rules in parallel but saves points as each completes.
    """
    from app.database.crud.crud_user import user_crud

    # Filter rules based on premium status
    rules_to_run = [
        rule for rule in self.rules
        if is_premium or not rule.premium_only
    ]

    # Initialize analysis with empty sections
    await user_crud.init_analysis(db, user_id)

    print(f"🚀 Running {len(rules_to_run)} rules in parallel with incremental updates...")

    async def run_rule_with_incremental_update(rule: BaseRule) -> List[ImprovementPoint]:
        """Run rule and save points immediately when done"""
        try:
            points = await rule.check(resume)

            if len(points) > 0:
                print(f"✓ {rule.rule_id}: {len(points)} points - saving incrementally")

                # Convert to dict for JSONB storage
                points_dict = [p.model_dump(mode='json') for p in points]

                # Save points immediately (one DB update per rule)
                await user_crud.add_improvement_points_incremental(db, user_id, points_dict)

            return points

        except Exception as e:
            import traceback
            print(f"✗ Error in rule {rule.rule_id}: {e}")
            print(traceback.format_exc())
            return []

    # 🚀 Execute ALL rules in parallel
    results = await asyncio.gather(*[
        run_rule_with_incremental_update(rule)
        for rule in rules_to_run
    ])

    # Flatten all points
    all_points = []
    for points in results:
        all_points.extend(points)

    print(f"✅ All {len(rules_to_run)} rules completed. Total points: {len(all_points)}")

    # Build final sections with scores
    sections = self._build_sections(all_points)
    score = calculate_overall_score(sections)
    label, subtitle = AnalysisConfig.get_score_label(score)

    # Calculate potential score
    potential_sections = []
    for section in sections:
        potential_section = AnalysisSection(
            id=section.id,
            title=section.title,
            current_points=100,
            max_points=100,
            percentage=100,
            status="Strong",
            improvement_points=[]
        )
        potential_sections.append(potential_section)
    potential_score = calculate_overall_score(potential_sections)

    # Create final analysis result
    final_analysis = AnalysisResult(
        score=score,
        label=label,
        subtitle=subtitle,
        sections=sections,
        total_improvements=len(all_points),
        potential_score=potential_score,
        generated_at=datetime.utcnow()
    )

    # Mark as complete - only add scores, not points (they're already saved incrementally)
    await user_crud.mark_analysis_complete(
        db,
        user_id,
        score=score,
        label=label,
        subtitle=subtitle,
        total_improvements=len(all_points),
        potential_score=potential_score
    )

    print(f"✅ Analysis marked complete. Final score: {score}")
```

**Testing:**
- [ ] Method signature correct
- [ ] Imports work
- [ ] No syntax errors

---

## Phase 3: Backend - Celery Tasks

### Commit 3: Modify Resume Upload Task
**Files:** `backend/app/core/tasks.py`

**Changes:**
- [ ] Split task into two phases: parsing and analysis
- [ ] Call `analyze_resume_incremental()` instead of old method
- [ ] Update task states appropriately

**Code:**
```python
async def _process_resume_upload_task(file_content: bytes, filename: str, user_id: int):
    """Async implementation with two-phase processing"""
    logger.info(f"Starting resume processing task for user {user_id}, filename: {filename}")

    temp_file_path = None
    parse_service = None

    try:
        # Validate file size
        file_size = len(file_content)
        if file_size > ParseService.MAX_FILE_SIZE:
            raise ValueError(f"File size exceeds limit")

        # Save to temp file
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"resume_{user_id}_{filename}")
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_content)

        del file_content
        gc.collect()

        # ========================================
        # PHASE 1: PARSE RESUME
        # ========================================
        logger.info("📄 Phase 1: Parsing resume...")
        parse_service = ParseService()
        parsed_data = await parse_service.parse_resume_file(temp_file_path)

        logger.info(f"✅ Parsing complete. Updating resume data...")
        await _update_user_resume_data(user_id, parsed_data)

        del parse_service
        del parsed_data
        gc.collect()

        # ========================================
        # PHASE 2: ANALYZE RESUME (INCREMENTAL)
        # ========================================
        logger.info("🔍 Phase 2: Starting incremental analysis...")
        await _generate_analysis_incremental(user_id)

        # Cleanup
        try:
            os.remove(temp_file_path)
            logger.info(f"Temporary file removed: {temp_file_path}")
        except Exception as e:
            logger.warning(f"Failed to remove temp file: {e}")

        logger.info(f"✅ Resume processing completed for user {user_id}")
        return {
            'status': 'completed',
            'user_id': user_id,
            'message': 'Resume processed successfully'
        }

    except Exception as e:
        logger.error(f"Exception in process_resume_upload task: {e}", exc_info=True)

        # Cleanup on error
        if 'file_content' in locals():
            del file_content
        if parse_service is not None:
            del parse_service
        gc.collect()

        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as cleanup_error:
                logger.warning(f"Failed to remove temp file: {cleanup_error}")

        return {
            'status': 'error',
            'error': str(e),
            'user_id': user_id,
            'message': f'Task failed: {str(e)}'
        }


async def _generate_analysis_incremental(user_id: int):
    """Generate analysis with incremental updates"""
    from app.database.session import SessionLocal
    from app.database.crud.crud_user import user_crud
    from app.services.analysis.analysis_service import analysis_service

    logger.info(f"🔍 Starting incremental analysis for user {user_id}")

    async with SessionLocal() as db:
        # Get user
        user = await user_crud.get(db, user_id)
        if not user:
            logger.warning(f"User {user_id} not found")
            return

        # Get resume data
        resume_data = await user_crud.get_resume_data(db, user_id=user_id)
        if not resume_data:
            logger.warning(f"No resume data for user {user_id}")
            return

        # Run incremental analysis (parallel rules with incremental updates)
        await analysis_service.analyze_resume_incremental(
            resume_data,
            user_id=user_id,
            db=db,
            is_premium=user.is_premium
        )

        logger.info(f"✅ Incremental analysis completed for user {user_id}")
```

**Testing:**
- [ ] Task imports successfully
- [ ] No syntax errors
- [ ] Logic flow correct

---

## Phase 4: Backend - API Endpoints

### Commit 4: Add Analysis Status Endpoint
**Files:** `backend/app/api/v1/endpoints/analysis.py`

**Changes:**
- [ ] Add `GET /analysis/status` endpoint
- [ ] Returns current progress and incremental points

**Code:**
```python
@router.get("/status")
async def get_analysis_status(
    db: AsyncDB,
    current_user: CurrentUser,
) -> Any:
    """
    Get current analysis status with incremental improvement points.
    Used for polling during analysis.
    """
    status_data = await user_crud.get_analysis_status(db, user_id=current_user.id)

    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis status not found"
        )

    return {
        'status': status_data['status'],  # 'none', 'analyzing', 'completed', 'error'
        'analysis_result': status_data['analysis_result']  # Incremental data
    }
```

**Testing:**
- [ ] Endpoint added to router
- [ ] No syntax errors
- [ ] Authentication required

---

## Phase 5: Frontend - API Client

### Commit 5: Add Analysis Status API Method
**Files:** `frontend/src/shared/services/api/analysisApi.ts`

**Changes:**
- [ ] Add `getAnalysisStatus()` method

**Code:**
```typescript
// Add to analysisApi object
async getAnalysisStatus(): Promise<{
  status: 'none' | 'analyzing' | 'completed' | 'error';
  analysis_result: any;
}> {
  const response = await api.get('/analysis/status');
  return response.data;
}
```

**Testing:**
- [ ] TypeScript compiles
- [ ] Method signature correct

---

## Phase 6: Frontend - StartPage Changes

### Commit 6: Modify StartPage Upload Flow
**Files:** `frontend/src/features/start/StartPage.tsx`

**Changes:**
- [ ] Poll until parsing completes (no longer wait for full analysis)
- [ ] Redirect to `/refine` immediately after parsing
- [ ] Pass indication that analysis is in progress

**Code:**
```typescript
// In pollTask function, update the logic:
const pollTask = async () => {
  try {
    const result = await resumeApi.getUploadResult(taskIdParam);

    // Check if resume_data has been updated (parsing complete)
    if (result.status === 'completed' || result.message?.includes('processed')) {
      // ✅ Parsing done! Redirect immediately
      clearInterval(interval);
      setIsProcessingUpload(false);
      setUploadError(null);

      // Check onboarding
      if (user && !user.has_completed_onboarding) {
        navigate('/onboarding?redirect=/refine', { replace: true });
      } else {
        // Navigate to refine - analysis will continue in background
        navigate('/refine?analyzing=true', { replace: true });
      }
    } else if (result.status === 'error' || result.state === 'FAILURE') {
      // Handle error
      clearInterval(interval);
      setIsProcessingUpload(false);
      setUploadError(result.error || t('errors.uploadFailed'));
      navigate('/start', { replace: true });
    } else {
      // Keep polling
      setTimeout(pollTask, 2000);
    }
  } catch (error) {
    console.error('Error polling task:', error);
    setTimeout(pollTask, 5000);
  }
};
```

**Testing:**
- [ ] No TypeScript errors
- [ ] Logic flow correct

---

## Phase 7: Frontend - RefinePage Changes

### Commit 7: Add Progressive Analysis Polling
**Files:** `frontend/src/features/refine/RefinePage.tsx`

**Changes:**
- [ ] Check for `analyzing=true` query param
- [ ] Poll `/analysis/status` every 3 seconds while analyzing
- [ ] Handle error status from backend
- [ ] Update improvement points incrementally
- [ ] Show progress indicator

**Code:**
```typescript
// Add state
const [searchParams] = useSearchParams();
const [isAnalyzing, setIsAnalyzing] = useState(searchParams.get('analyzing') === 'true');

// Poll for analysis progress
useEffect(() => {
  if (!isAnalyzing) return;

  let pollTimeoutId: NodeJS.Timeout;

  const pollAnalysisStatus = async () => {
    try {
      const statusData = await analysisApi.getAnalysisStatus();

      // Update analysis with incremental points
      if (statusData.analysis_result) {
        setAnalysis(statusData.analysis_result);
      }

      // Check if complete
      if (statusData.status === 'completed') {
        console.log('✅ Analysis complete!');
        setIsAnalyzing(false);

        // Load final analysis with scores
        const finalAnalysis = await analysisApi.getAnalysis();
        setAnalysis(finalAnalysis);

        // Remove query param
        navigate('/refine', { replace: true });
      } else if (statusData.status === 'error') {
        // Backend reported error
        console.error('❌ Analysis failed');
        setIsAnalyzing(false);
        // TODO: Show error message to user
      } else if (statusData.status === 'analyzing') {
        // Continue polling every 3 seconds
        pollTimeoutId = setTimeout(pollAnalysisStatus, 3000);
      }
    } catch (error) {
      console.error('Error polling analysis status:', error);
      // Retry with longer delay
      pollTimeoutId = setTimeout(pollAnalysisStatus, 5000);
    }
  };

  // Start polling
  pollAnalysisStatus();

  // Cleanup on unmount
  return () => {
    clearTimeout(pollTimeoutId);
  };
}, [isAnalyzing]);

// Pass isAnalyzing to child components
<ImprovementSections
  sections={analysis?.sections || []}
  resume={localResume || resume}
  onFixApplied={handleFixApplied}
  onNavigateToField={handleNavigateToField}
  onFixMarked={handleFixMarked}
  dismissedPointIds={dismissedPointIds}
  isPremium={user?.is_premium || false}
  isAnalyzing={isAnalyzing}  // ✅ NEW
/>
```

**Testing:**
- [ ] No TypeScript errors
- [ ] Polling logic correct

---

## Phase 8: Frontend - ScoreBar Component

### Commit 8: Update ScoreBar with Analyzing State
**Files:** `frontend/src/features/refine/components/ScoreBar.tsx`

**Changes:**
- [ ] Accept `isAnalyzing` prop
- [ ] Show simple "Analyzing..." message (no progress numbers)

**Code:**
```typescript
type Props = {
  // ... existing props
  isAnalyzing?: boolean;
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
  isAnalyzing = false,  // ✅ NEW
}) => {
  return (
    <Box>
      {isAnalyzing && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f9ff', borderRadius: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
              Analyzing your resume...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Existing score display */}
      {/* ... */}
    </Box>
  );
};
```

**Testing:**
- [ ] Component renders
- [ ] Message shows when analyzing

---

## Phase 9: Frontend - ImprovementSections UI

### Commit 9: Add Loading States to ImprovementSections
**Files:** `frontend/src/features/refine/components/ImprovementSections.tsx`

**Changes:**
- [ ] Accept `isAnalyzing` prop
- [ ] Show spinner in section title when analyzing
- [ ] Show placeholder card when section is empty during analysis
- [ ] Show actual points as they arrive

**Code:**
```typescript
import Fade from '@mui/material/Fade';

type Props = {
  // ... existing props
  isAnalyzing?: boolean;
};

const ImprovementSections: React.FC<Props> = ({
  sections,
  resume,
  onFixApplied,
  onNavigateToField,
  onFixMarked,
  dismissedPointIds,
  isPremium = false,
  isAnalyzing = false,  // ✅ NEW
}) => {
  // ... existing code

  return (
    <Box sx={{ pt: 1, px: 2, pb: 2, overflow: 'auto' }}>
      {sectionsWithPremiumPoints.map((s) => {
        const hasPoints = s.improvement_points.length > 0;

        return (
          <Accordion
            expanded={expandedSections.has(s.id)}
            onChange={handleAccordionChange(s.id)}
            key={s.id}
            sx={{ ...breakdownCard, ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <Box sx={breakdownTitle}>
                  {/* ✅ Spinner left of section title when analyzing */}
                  {isAnalyzing && (
                    <CircularProgress size={14} thickness={4} sx={{ mr: 1 }} />
                  )}
                  <Typography sx={breakdownName}>{s.title}</Typography>
                  <Typography sx={breakdownCount}>
                    ({s.improvement_points.length} {s.improvement_points.length === 1 ? 'issue' : 'issues'})
                  </Typography>
                </Box>
                {/* ... existing progress bar */}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ padding: '6px 12px 12px' }}>
              {hasPoints ? (
                // ✅ Show points as they arrive
                s.improvement_points.map((point, index) => (
                  <Fade in={true} timeout={300} key={point.id}>
                    <div>
                      <ImprovementPoint
                        point={point}
                        resume={resume}
                        onFixApplied={onFixApplied}
                        onNavigateToField={onNavigateToField}
                        onFixMarked={onFixMarked}
                        isDismissed={dismissedPointIds?.has(point.id) || false}
                        isPremium={isPremium}
                      />
                    </div>
                  </Fade>
                ))
              ) : isAnalyzing ? (
                // ✅ Show single placeholder card while analyzing
                <Box sx={{
                  p: 2,
                  borderRadius: '8px',
                  bgcolor: '#f9fafb',
                  border: '1px dashed #d1d5db',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '14px', color: '#9ca3af' }}>
                    Checking this section...
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '12px' }}>
                  No issues found in this section. Great job!
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};
```

**Testing:**
- [ ] Component renders
- [ ] Spinner shows left of title when analyzing
- [ ] Placeholder card shows when empty during analysis
- [ ] Points appear as they're added

---

## Phase 10: Testing & Refinement

### Testing Checklist (No Commit Required)
**Manual Testing Checklist:**

- [ ] **Upload Resume Flow:**
  - [ ] Upload PDF/DOCX file on StartPage
  - [ ] See parsing animation
  - [ ] Redirect to RefinePage immediately after parsing
  - [ ] See "Analyzing..." indicator on RefinePage

- [ ] **Progressive Analysis:**
  - [ ] Improvement points appear incrementally
  - [ ] Sections populate as rules complete
  - [ ] Spinner visible in section titles while analyzing
  - [ ] Placeholder card shows in empty sections during analysis

- [ ] **Resume Editing During Analysis:**
  - [ ] Can edit resume fields while analysis runs
  - [ ] Auto-save works
  - [ ] No conflicts with ongoing analysis

- [ ] **Analysis Completion:**
  - [ ] Final scores calculated
  - [ ] "Analyzing..." indicator disappears
  - [ ] Spinners disappear from section titles
  - [ ] All improvement points visible

- [ ] **Error Handling:**
  - [ ] Upload error shows correctly
  - [ ] Analysis errors don't break UI
  - [ ] Retry mechanisms work

- [ ] **Backward Compatibility:**
  - [ ] Existing users with old `analysis_result` still work
  - [ ] Refresh analysis button works
  - [ ] Mark as fixed functionality intact

---

## Phase 11: Documentation

### Commit 10: Update spec.xml Files
**Files to update:**

- [ ] `backend/app/services/analysis/spec.xml`
- [ ] `backend/app/core/spec.xml`
- [ ] `frontend/src/features/refine/spec.xml`
- [ ] `frontend/src/features/start/spec.xml`

**Changes:**
- [ ] Document new incremental analysis flow
- [ ] Update architecture diagrams
- [ ] Add new API endpoints
- [ ] Document new CRUD methods

---

### Commit 11: Update CLAUDE.md
**File:** `CLAUDE.md`

**Changes:**
- [ ] Add section on progressive analysis
- [ ] Update API structure section (new `/analysis/status` endpoint)
- [ ] Add polling mechanism notes

---

## Deployment Checklist

- [ ] No TypeScript errors
- [ ] Backend tests pass (if any)
- [ ] Frontend builds successfully
- [ ] Test on staging environment
- [ ] Monitor Celery worker performance
- [ ] Check database JSONB update performance
- [ ] Verify polling doesn't overload API
- [ ] Deploy to production
- [ ] Monitor error logs for 24 hours

---

## Rollback Plan

If issues occur in production:

1. **Code:** Revert to previous commit and redeploy
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Quick Fix:** Reset analysis status for all users
   ```sql
   UPDATE users SET analysis_result = jsonb_set(
     COALESCE(analysis_result, '{}'::jsonb),
     '{status}',
     '"none"'
   );
   ```

---

## Success Metrics

After deployment, measure:

- [ ] Average time to first improvement point visible
- [ ] User engagement during analysis (do they edit?)
- [ ] Analysis completion rate
- [ ] Error rate in incremental updates
- [ ] User feedback on progressive loading

---

## Notes

- Keep `analyze_resume()` method intact for backward compatibility
- Monitor Celery worker memory usage (incremental updates add overhead)
- Consider adding WebSocket support later for real-time updates (instead of polling)
- Premium users get faster analysis (fewer rules skipped)
