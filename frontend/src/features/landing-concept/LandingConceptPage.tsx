import type React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { COLORS } from "../../shared/theme/theme";
import ResumeRenderer from "../../shared/components/ResumeRenderer";
import type { ResumeData } from "../../shared/types/resume";
import "./LandingConceptPage.css";
import LandingConceptQuestionnaire from "./LandingConceptQuestionnaire";
import LandingConceptPreviewBadge from "./LandingConceptPreviewBadge";

type CopyItem = {
  title: string;
  body: string;
};

const landingConceptVars: React.CSSProperties & Record<string, string> = {
  "--lc-bg": COLORS.landing.background,
  "--lc-bg-alt": COLORS.landing.backgroundAlt,
  "--lc-surface": COLORS.landing.surface,
  "--lc-surface-strong": COLORS.landing.surfaceStrong,
  "--lc-text": COLORS.landing.text,
  "--lc-muted": COLORS.landing.mutedText,
  "--lc-accent": COLORS.landing.accent,
  "--lc-accent-alt": COLORS.landing.accentAlt,
  "--lc-border": COLORS.landing.border,
  "--lc-border-soft": COLORS.landing.borderSoft,
  "--lc-shadow": COLORS.landing.shadow,
  "--lc-shadow-hover": COLORS.landing.shadowHover,
  "--lc-shadow-strong": COLORS.landing.shadowStrong,
  "--lc-shadow-button": COLORS.landing.shadowButton,
  "--lc-shadow-button-hover": COLORS.landing.shadowButtonHover,
  "--lc-shadow-card": COLORS.landing.shadowCard,
  "--lc-shadow-overlay": COLORS.landing.shadowOverlay,
  "--lc-shadow-overlay-soft": COLORS.landing.shadowOverlaySoft,
  "--lc-shadow-success": COLORS.landing.shadowSuccess,
  "--lc-shadow-strong-hover": COLORS.landing.shadowStrongHover,
  "--lc-gradient": COLORS.landing.gradient,
  "--lc-gradient-soft": COLORS.landing.gradientSoft,
  "--lc-mask-fade": COLORS.landing.maskFade,
  "--lc-blue-tint": COLORS.landing.blueTint,
  "--lc-lavender": COLORS.landing.lavender,
  "--lc-cream": COLORS.landing.cream,
  "--lc-cream-border": COLORS.landing.creamBorder,
  "--lc-gold": COLORS.landing.gold,
  "--lc-gold-dark": COLORS.landing.goldDark,
  "--lc-brown": COLORS.landing.brown,
  "--lc-success": COLORS.landing.success,
};

const resumeGuideImageSrc = "/project-manager-resume-professional.png";
const OPEN_LANDING_BUILDER_STEP_EVENT = "landing-builder:open-step";

function LandingConceptPage() {
  const { t } = useTranslation();

  const scrollToBuilder = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const firstBuilderStep = document.getElementById("landing-builder-contact-info");
    const builder = firstBuilderStep ?? document.getElementById("builder");
    if (!builder) {
      return;
    }

    event.preventDefault();
    const builderHandledScroll = !document.dispatchEvent(
      new CustomEvent(OPEN_LANDING_BUILDER_STEP_EVENT, {
        cancelable: true,
        detail: { stepId: "contact-info", focusFirstField: true },
      }),
    );
    if (builderHandledScroll) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => builder.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  }, []);

  const heroBadges = useMemo(
    () => [
      t("landingConcept.hero.badges.0"),
    ],
    [t],
  );

  const resumeGuidePrinciples = useMemo<CopyItem[]>(
    () => [
      {
        title: t("landingConcept.resumeGuide.principles.0.title"),
        body: t("landingConcept.resumeGuide.principles.0.body"),
      },
      {
        title: t("landingConcept.resumeGuide.principles.1.title"),
        body: t("landingConcept.resumeGuide.principles.1.body"),
      },
      {
        title: t("landingConcept.resumeGuide.principles.2.title"),
        body: t("landingConcept.resumeGuide.principles.2.body"),
      },
      {
        title: t("landingConcept.resumeGuide.principles.3.title"),
        body: t("landingConcept.resumeGuide.principles.3.body"),
      },
      {
        title: t("landingConcept.resumeGuide.principles.4.title"),
        body: t("landingConcept.resumeGuide.principles.4.body"),
      },
      {
        title: t("landingConcept.resumeGuide.principles.5.title"),
        body: t("landingConcept.resumeGuide.principles.5.body"),
      },
    ],
    [t],
  );

  const resumeGuideChecklist = useMemo(
    () => [
      t("landingConcept.resumeGuide.checklist.items.0"),
      t("landingConcept.resumeGuide.checklist.items.1"),
      t("landingConcept.resumeGuide.checklist.items.2"),
      t("landingConcept.resumeGuide.checklist.items.3"),
      t("landingConcept.resumeGuide.checklist.items.4"),
    ],
    [t],
  );

  const previewResume = useMemo<ResumeData>(
    () => ({
      personal_info: {
        first_name: t("landingConcept.preview.resume.firstName"),
        last_name: t("landingConcept.preview.resume.lastName"),
        current_role: t("landingConcept.preview.resume.role"),
        city: t("landingConcept.preview.resume.city"),
        country: t("landingConcept.preview.resume.country"),
        contacts: {
          email: t("landingConcept.preview.resume.email"),
          phone: t("landingConcept.preview.resume.phone"),
          linkedin: t("landingConcept.preview.resume.linkedin"),
        },
      },
      professional_summary: t("landingConcept.preview.resume.summary"),
      skills: [
        t("landingConcept.preview.resume.skills.0"),
        t("landingConcept.preview.resume.skills.1"),
        t("landingConcept.preview.resume.skills.2"),
        t("landingConcept.preview.resume.skills.3"),
        t("landingConcept.preview.resume.skills.4"),
        t("landingConcept.preview.resume.skills.5"),
      ],
      work_experience: [
        {
          job_title: t("landingConcept.preview.resume.experience.title"),
          company: t("landingConcept.preview.resume.experience.company"),
          city: t("landingConcept.preview.resume.experience.city"),
          country: t("landingConcept.preview.resume.experience.country"),
          start_date: t("landingConcept.preview.resume.experience.startDate"),
          end_date: t("landingConcept.preview.resume.experience.endDate"),
          achievements: [
            t("landingConcept.preview.resume.experience.achievements.0"),
            t("landingConcept.preview.resume.experience.achievements.1"),
            t("landingConcept.preview.resume.experience.achievements.2"),
          ],
        },
      ],
      education: [
        {
          institution: t("landingConcept.preview.resume.education.institution"),
          degree: t("landingConcept.preview.resume.education.degree"),
          field_of_study: t("landingConcept.preview.resume.education.field"),
          city: t("landingConcept.preview.resume.education.city"),
          country: t("landingConcept.preview.resume.education.country"),
          end_date: t("landingConcept.preview.resume.education.endDate"),
        },
      ],
    }),
    [t],
  );

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content");

    document.title = t("landingConcept.meta.title");
    if (descriptionTag) {
      descriptionTag.setAttribute("content", t("landingConcept.meta.description"));
    }

    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription) {
        descriptionTag.setAttribute("content", previousDescription);
      }
    };
  }, [t]);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>("[data-lc-reveal]");
    if (!revealElements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -64px 0px",
      },
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="lc-page" style={landingConceptVars}>
      <div className="lc-aurora lc-aurora--one" aria-hidden="true" />
      <div className="lc-aurora lc-aurora--two" aria-hidden="true" />
      <div className="lc-grid" aria-hidden="true" />

      <header className="lc-header">
        <div className="lc-shell lc-header__inner">
          <Link to="/landing-concept" className="lc-brand" aria-label="Rezynt">
            <img
              src="/rezynt-logo-with-name.svg"
              alt="Rezynt"
              className="lc-brand__image"
              width="206"
              height="52"
            />
          </Link>

          <nav className="lc-nav" aria-label={t("landingConcept.nav.label")}>
            <a href="#builder">{t("landingConcept.nav.builder")}</a>
          </nav>
        </div>
      </header>

      <section className="lc-hero">
        <div className="lc-shell lc-hero__grid">
          <div className="lc-hero__copy" data-lc-reveal>
            <div className="lc-badges" aria-label={t("landingConcept.hero.badgeLabel")}>
              {heroBadges.map((badge) => (
                <span key={badge} className="lc-badge">
                  {badge}
                </span>
              ))}
            </div>
            <h1 className="lc-title">
              <span className="lc-title__lead">{t("landingConcept.hero.titleLead")}</span>{" "}
              <span className="lc-title__accent">{t("landingConcept.hero.titleAccent")}</span>{" "}
              <span className="lc-title__lead">{t("landingConcept.hero.titleTail")}</span>
            </h1>
            <p className="lc-lead">{t("landingConcept.hero.subtitle")}</p>
          </div>
          <div className="lc-hero__resume" data-lc-reveal style={{ "--lc-delay": "120ms" } as React.CSSProperties}>
            <div className="lc-resume-showcase" aria-label={t("landingConcept.preview.ariaLabel")}>
              <div className="lc-resume-showcase__halo" aria-hidden="true" />
              <div className="lc-resume-showcase__card">
                <ResumeRenderer
                  data={previewResume}
                  templateId="professional"
                  isPreview
                  fitToContainer
                />
              </div>
              <LandingConceptPreviewBadge
                labels={[
                  t("landingConcept.preview.badges.ready"),
                  t("landingConcept.preview.badges.ats"),
                ]}
              />
            </div>
            <a className="lc-preview-cta" href="#builder" onClick={scrollToBuilder}>
              <span>{t("landingConcept.hero.cta")}</span>
              <KeyboardArrowDownRoundedIcon className="lc-preview-cta__icon" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <LandingConceptQuestionnaire />

      <section className="lc-resume-guide" data-lc-reveal>
        <div className="lc-shell lc-resume-guide__grid">
          <div className="lc-resume-guide__copy">
            <span className="lc-resume-guide__eyebrow">{t("landingConcept.resumeGuide.eyebrow")}</span>
            <h2 className="lc-resume-guide__title">{t("landingConcept.resumeGuide.title")}</h2>
            <p className="lc-resume-guide__lead">{t("landingConcept.resumeGuide.lead")}</p>

            <div className="lc-resume-guide__principles">
              {resumeGuidePrinciples.map((item, index) => (
                <article key={item.title} className="lc-resume-guide__principle">
                  <span className="lc-resume-guide__number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="lc-resume-guide__visual" aria-label={t("landingConcept.resumeGuide.visualAriaLabel")}>
            <div className="lc-resume-guide__image-card">
              <img
                src={resumeGuideImageSrc}
                alt={t("landingConcept.resumeGuide.imageAlt")}
                className="lc-resume-guide__image"
              />
            </div>

            <div className="lc-resume-guide__checklist">
              <h3>{t("landingConcept.resumeGuide.checklist.title")}</h3>
              <ul>
                {resumeGuideChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="lc-shell lc-resume-guide__cta">
          <a className="lc-resume-guide__button" href="#builder" onClick={scrollToBuilder}>
            <KeyboardArrowUpRoundedIcon aria-hidden="true" />
            <span>{t("landingConcept.resumeGuide.cta")}</span>
          </a>
        </div>
      </section>

      <footer className="lc-footer">
        <div className="lc-shell lc-footer__inner">
          <div className="lc-footer__meta">
            <img src="/rezynt-logo-with-name.svg" alt="Rezynt" className="lc-footer__brand" />
            <p>{t("landing.footer.copy")}</p>
          </div>

          <div className="lc-footer__links">
            <a href={`mailto:${t("landing.footer.email")}`}>{t("landing.footer.email")}</a>
            <Link to="/privacy-policy.html">{t("landing.footer.links.privacy")}</Link>
            <Link to="/terms-of-service.html">{t("landing.footer.links.terms")}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingConceptPage;
