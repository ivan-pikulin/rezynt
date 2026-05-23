import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useAuthContext } from "../../shared/contexts/AuthContext";
import { yandexMetrikaService } from "../../shared/services/yandexMetrikaService";
import { useBuilder } from "../builder/hooks/useBuilder";
import { BUILDER_STEPS, type BuilderState, type BuilderStep } from "../builder/types/builder";
import { ContactInfoStep } from "../builder/components/ContactInfoStep";
import { WorkExperienceStep } from "../builder/components/WorkExperienceStep";
import { EducationStep } from "../builder/components/EducationStep";
import { SkillsStep } from "../builder/components/SkillsStep";
import { SummaryStep } from "../builder/components/SummaryStep";
import type { ResumeData } from "../../shared/types/resume";

const getLandingStepSectionId = (stepId: BuilderStep) => `landing-builder-${stepId}`;
const OPEN_LANDING_BUILDER_STEP_EVENT = "landing-builder:open-step";
const TEMPLATE_SELECTION_ROUTE = "/export";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stepFieldSelector = [
  'input:not([type="hidden"]):not([disabled]):not([readonly])',
  "textarea:not([disabled]):not([readonly])",
  "select:not([disabled])",
].join(", ");

type OpenLandingBuilderStepEventDetail = {
  stepId?: BuilderStep;
  focusFirstField?: boolean;
};

const focusFirstStepField = (stepId: BuilderStep) => {
  const section = document.getElementById(getLandingStepSectionId(stepId));
  const field = section?.querySelector<HTMLElement>(stepFieldSelector);
  field?.focus({ preventScroll: true });
};

const getResumePayload = (builderState: BuilderState): ResumeData => ({
  personal_info: builderState.personal_info,
  professional_summary: builderState.professional_summary,
  skills: builderState.skills,
  work_experience: builderState.work_experience,
  education: builderState.education,
  languages_spoken: builderState.languages_spoken,
  awards: builderState.awards,
});

function LandingConceptQuestionnaire() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, login } = useAuthContext();
  const [hasPersonalDataConsent, setHasPersonalDataConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const hasTrackedFormStartRef = useRef(false);
  const trackedCompletedStepsRef = useRef<Set<BuilderStep>>(new Set());
  const [expandedStepIds, setExpandedStepIds] = useState<Record<BuilderStep, boolean>>({
    "contact-info": true,
    "work-experience": false,
    education: false,
    skills: false,
    summary: false,
  });
  const {
    state,
    updateField,
    clearBuilder,
  } = useBuilder();

  const stepLabels = useMemo(
    () => BUILDER_STEPS.map((step) => t(`builder.steps.${step.id}`)),
    [t],
  );
  const trackFormStartedOnce = useCallback((stepId: BuilderStep) => {
    if (hasTrackedFormStartRef.current) {
      return;
    }

    hasTrackedFormStartRef.current = true;
    yandexMetrikaService.trackLandingFormStarted(stepId);
  }, []);

  const trackStepCompletedOnce = useCallback((stepId: BuilderStep, stepIndex: number) => {
    if (trackedCompletedStepsRef.current.has(stepId)) {
      return;
    }

    trackedCompletedStepsRef.current.add(stepId);
    yandexMetrikaService.trackLandingFormStepCompleted(stepId, stepIndex);
  }, []);

  const handleStepUpdate = useCallback((stepId: BuilderStep, field: keyof BuilderState, value: BuilderState[keyof BuilderState]) => {
    trackFormStartedOnce(stepId);
    updateField(field as any, value as any);
  }, [trackFormStartedOnce, updateField]);

  const renderStepContent = (stepId: BuilderStep) => {
    const onUpdate = (field: keyof BuilderState, value: BuilderState[keyof BuilderState]) => {
      handleStepUpdate(stepId, field, value);
    };

    switch (stepId) {
      case "contact-info":
        return <ContactInfoStep state={state} onUpdate={onUpdate} />;
      case "work-experience":
        return <WorkExperienceStep state={state} onUpdate={onUpdate} />;
      case "education":
        return <EducationStep state={state} onUpdate={onUpdate} />;
      case "skills":
        return <SkillsStep state={state} onUpdate={onUpdate} />;
      case "summary":
        return <SummaryStep state={state} onUpdate={onUpdate} />;
      default:
        return null;
    }
  };

  const scrollToStep = useCallback((stepId: BuilderStep, focusFirstField = false) => {
    const nextSection = document.getElementById(getLandingStepSectionId(stepId));
    nextSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focusFirstField) {
      window.setTimeout(() => focusFirstStepField(stepId), 450);
    }
  }, []);

  const openStepAndScroll = useCallback((stepId: BuilderStep, focusFirstField = false) => {
    setExpandedStepIds((previous) => ({ ...previous, [stepId]: true }));
    yandexMetrikaService.trackLandingFormStepOpened(
      stepId,
      BUILDER_STEPS.findIndex((step) => step.id === stepId),
    );
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => scrollToStep(stepId, focusFirstField));
    });
  }, [scrollToStep]);

  const toggleStep = (stepId: BuilderStep) => {
    setExpandedStepIds((previous) => {
      const willExpand = !previous[stepId];
      if (willExpand) {
        yandexMetrikaService.trackLandingFormStepOpened(
          stepId,
          BUILDER_STEPS.findIndex((step) => step.id === stepId),
        );
      }
      return { ...previous, [stepId]: willExpand };
    });
  };

  useEffect(() => {
    const handleExternalStepOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenLandingBuilderStepEventDetail>).detail;
      const stepId = detail?.stepId;
      if (!stepId) {
        return;
      }

      event.preventDefault();
      openStepAndScroll(stepId, detail.focusFirstField ?? true);
    };

    document.addEventListener(OPEN_LANDING_BUILDER_STEP_EVENT, handleExternalStepOpen);
    return () => document.removeEventListener(OPEN_LANDING_BUILDER_STEP_EVENT, handleExternalStepOpen);
  }, [openStepAndScroll]);

  const handleFinish = async () => {
    if (isSubmitting) {
      return;
    }

    setFinishError(null);
    setIsSubmitting(true);

    try {
      const resumeData = getResumePayload(state);
      const finalStepIndex = BUILDER_STEPS.length - 1;
      trackStepCompletedOnce(BUILDER_STEPS[finalStepIndex].id, finalStepIndex);
      yandexMetrikaService.trackLandingFormSubmitAttempt({
        is_authenticated: isAuthenticated,
        completed_steps: trackedCompletedStepsRef.current.size,
      });

      if (isAuthenticated) {
        const { resumeApi } = await import("../../shared/services/api");
        const savedResume = await resumeApi.updateResume(resumeData);
        queryClient.setQueryData(["resume", "user"], savedResume);
      } else {
        const email = state.personal_info?.contacts?.email?.trim() ?? "";

        if (!emailPattern.test(email)) {
          yandexMetrikaService.trackLandingFormSubmitError({
            reason: "missing_or_invalid_email",
            completed_steps: trackedCompletedStepsRef.current.size,
          });
          setFinishError(t("landingConcept.builder.emailRequiredForAccount"));
          openStepAndScroll("contact-info", true);
          return;
        }

        const [{ authApi }, { guestResumeService }] = await Promise.all([
          import("../../shared/services/api"),
          import("../../shared/services/guestResumeService"),
        ]);

        const tokens = await authApi.signupFromLanding({
          email,
          resume_data: resumeData,
        });

        const loginSucceeded = await login(tokens);
        if (!loginSucceeded) {
          throw new Error("Landing signup created tokens, but user authorization failed");
        }

        guestResumeService.clear();
        queryClient.setQueryData(["resume", "user"], resumeData);
        queryClient.removeQueries({ queryKey: ["resume", "guest"] });
      }

      yandexMetrikaService.trackLandingFormSubmitSuccess({
        is_authenticated: isAuthenticated,
        completed_steps: trackedCompletedStepsRef.current.size,
      });
      clearBuilder();
      navigate(TEMPLATE_SELECTION_ROUTE);
    } catch (error) {
      console.error("Error saving resume from builder:", error);
      const responseStatus = (error as { response?: { status?: number } }).response?.status;
      yandexMetrikaService.trackLandingFormSubmitError({
        reason: responseStatus === 409 ? "email_already_exists" : "submit_failed",
        status: responseStatus,
        completed_steps: trackedCompletedStepsRef.current.size,
      });
      setFinishError(
        responseStatus === 409
          ? t("landingConcept.builder.emailAlreadyExists")
          : t("landingConcept.builder.submitError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="lc-builder" id="builder">
      <div className="lc-shell">
        <div className="lc-builder__stack" aria-label={t("landingConcept.builder.stepperLabel")}>
          {BUILDER_STEPS.map((step, index) => {
            const nextStep = BUILDER_STEPS[index + 1];
            const isExpanded = expandedStepIds[step.id];
            const contentId = `${getLandingStepSectionId(step.id)}-content`;

            return (
              <Paper
                key={step.id}
                className="lc-builder__panel"
                id={getLandingStepSectionId(step.id)}
                data-lc-reveal
              >
                <button
                  type="button"
                  className={`lc-builder__current-step${isExpanded ? " is-expanded" : ""}`}
                  onClick={() => toggleStep(step.id)}
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                >
                  <span className="lc-builder__step-index">{index + 1}</span>
                  <h2 className="lc-builder__step-label">{stepLabels[index]}</h2>
                  <KeyboardArrowDownRoundedIcon className="lc-builder__section-chevron" aria-hidden="true" />
                </button>

                {isExpanded && (
                  <div id={contentId}>
                    <Box className="lc-builder__content">{renderStepContent(step.id)}</Box>

                    {nextStep && (
                      <Box className="lc-builder__actions">
                        <Button
                          variant="contained"
                          endIcon={<KeyboardArrowDownRoundedIcon />}
                          onClick={() => {
                            trackStepCompletedOnce(step.id, index);
                            openStepAndScroll(nextStep.id, true);
                          }}
                          sx={{
                            borderRadius: "999px",
                            textTransform: "none",
                            px: 3,
                            fontWeight: 700,
                            width: "min(100%, 360px)",
                          }}
                        >
                          {stepLabels[index + 1]}
                        </Button>
                      </Box>
                    )}
                  </div>
                )}
              </Paper>
            );
          })}
        </div>

        <div className="lc-builder__final" data-lc-reveal>
          <Button
            className="lc-builder__final-button"
            variant="contained"
            onClick={handleFinish}
            disabled={!hasPersonalDataConsent || isSubmitting}
          >
            {isSubmitting ? t("landingConcept.builder.finalCtaLoading") : t("landingConcept.builder.finalCta")}
          </Button>

          {finishError && (
            <p className="lc-builder__error" role="alert">
              {finishError}
            </p>
          )}

          <label className="lc-builder__consent">
            <input
              type="checkbox"
              checked={hasPersonalDataConsent}
              onChange={(event) => setHasPersonalDataConsent(event.target.checked)}
              aria-label={t("landingConcept.builder.consentAria")}
            />
            <span>
              {t("landingConcept.builder.consentPrefix")}{" "}
              <a href="/privacy-policy.html" target="_blank" rel="noreferrer">
                {t("landingConcept.builder.consentLink")}
              </a>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}

export default LandingConceptQuestionnaire;
