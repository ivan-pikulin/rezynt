import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "../../shared/hooks/useAuth";
import { useUser } from "../../shared/hooks";
import { useBuilder } from "../builder/hooks/useBuilder";
import { BUILDER_STEPS } from "../builder/types/builder";
import { ContactInfoStep } from "../builder/components/ContactInfoStep";
import { WorkExperienceStep } from "../builder/components/WorkExperienceStep";
import { EducationStep } from "../builder/components/EducationStep";
import { SkillsStep } from "../builder/components/SkillsStep";
import { SummaryStep } from "../builder/components/SummaryStep";

type StepKey = "contact-info" | "work-experience" | "education" | "skills" | "summary";

const stepKeyMap: Record<StepKey, string> = {
  "contact-info": "contactInfo",
  "work-experience": "workExperience",
  education: "education",
  skills: "skills",
  summary: "summary",
};

function LandingConceptQuestionnaire() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const {
    state,
    updateField,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
    getNextStepLabel,
    clearBuilder,
  } = useBuilder();

  const currentStepIndex = BUILDER_STEPS.findIndex((step) => step.id === state.currentStep);
  const safeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const stepLabels = useMemo(
    () => BUILDER_STEPS.map((step) => t(`builder.steps.${step.id}`)),
    [t],
  );

  const getStepHeaderInfo = () => {
    const stepKey = stepKeyMap[state.currentStep as StepKey];
    return {
      title: t(`builder.${stepKey}.title`),
      description: t(`builder.${stepKey}.description`),
    };
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case "contact-info":
        return <ContactInfoStep state={state} onUpdate={updateField} />;
      case "work-experience":
        return <WorkExperienceStep state={state} onUpdate={updateField} />;
      case "education":
        return <EducationStep state={state} onUpdate={updateField} />;
      case "skills":
        return <SkillsStep state={state} onUpdate={updateField} />;
      case "summary":
        return <SummaryStep state={state} onUpdate={updateField} />;
      default:
        return null;
    }
  };

  const handleFinish = async () => {
    try {
      const { resumeApi } = await import("../../shared/services/api");
      await resumeApi.updateResume(state);

      const cacheKey = isAuthenticated ? "user" : "guest";
      queryClient.setQueryData(["resume", cacheKey], state);

      if (!isAuthenticated) {
        const { guestResumeService } = await import("../../shared/services/guestResumeService");
        guestResumeService.update(state);
      }

      clearBuilder();

      if (isAuthenticated && user && !user.has_completed_onboarding) {
        navigate("/onboarding?redirect=/refine");
      } else {
        navigate("/refine");
      }
    } catch (error) {
      console.error("Error saving resume from builder:", error);
      navigate("/refine");
    }
  };

  return (
    <section className="lc-builder" id="builder">
      <div className="lc-shell">
        <div className="lc-builder__head" data-lc-reveal>
          <div className="lc-section__eyebrow">{t("landingConcept.builder.eyebrow")}</div>
          <h2 className="lc-section__title">{t("landingConcept.builder.title")}</h2>
          <p className="lc-section__lead">{t("landingConcept.builder.subtitle")}</p>
        </div>

        <Paper className="lc-builder__panel" data-lc-reveal>
          <div className="lc-builder__top">
            <div className="lc-builder__headline">
              <div className="lc-builder__eyebrow">{t(`builder.steps.${state.currentStep}`)}</div>
              <Typography variant="h5" className="lc-builder__title">
                {getStepHeaderInfo().title}
              </Typography>
              <Typography variant="body2" className="lc-builder__description">
                {getStepHeaderInfo().description}
              </Typography>
            </div>

            <div className="lc-builder__progress" aria-label={t("landingConcept.builder.progressLabel")}>
              <div className="lc-builder__progress-meta">
                <span>{safeStepIndex + 1}</span>
                <span>/</span>
                <span>{BUILDER_STEPS.length}</span>
              </div>
              <div className="lc-builder__bar" aria-hidden="true">
                <i style={{ width: `${((safeStepIndex + 1) / BUILDER_STEPS.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="lc-builder__steps" aria-label={t("landingConcept.builder.stepperLabel")}>
            {BUILDER_STEPS.map((step, index) => {
              const isActive = step.id === state.currentStep;
              const isDone = state.completedSteps.includes(step.id);

              return (
                <button
                  key={step.id}
                  type="button"
                  className={`lc-builder__step${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
                  onClick={() => goToStep(step.id)}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="lc-builder__step-index">{index + 1}</span>
                  <span className="lc-builder__step-label">{stepLabels[index]}</span>
                </button>
              );
            })}
          </div>

          <Box className="lc-builder__content">{renderStepContent()}</Box>

          <Box className="lc-builder__actions">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={goToPreviousStep}
              disabled={!canGoBack()}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                px: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {t("builder.navigation.back")}
            </Button>

            {canGoNext() ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={goToNextStep}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 3,
                  fontWeight: 700,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {t("builder.navigation.next")}: {getNextStepLabel()}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleFinish}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 3,
                  fontWeight: 700,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {t("builder.navigation.finish")}
              </Button>
            )}
          </Box>
        </Paper>
      </div>
    </section>
  );
}

export default LandingConceptQuestionnaire;
