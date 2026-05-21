import type React from "react";
import { Fragment, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../shared/theme/theme";
import "./LandingConceptPage.css";
import LandingConceptQuestionnaire from "./LandingConceptQuestionnaire";

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

function LandingConceptPage() {
  const { t } = useTranslation();

  const heroBadges = useMemo(
    () => [
      t("landingConcept.hero.badges.0"),
    ],
    [t],
  );

  const heroFlow = useMemo(
    () => [
      {
        title: t("landingConcept.hero.flow.steps.0.title"),
        body: t("landingConcept.hero.flow.steps.0.body"),
      },
      {
        title: t("landingConcept.hero.flow.steps.1.title"),
        body: t("landingConcept.hero.flow.steps.1.body"),
      },
      {
        title: t("landingConcept.hero.flow.steps.2.title"),
        body: t("landingConcept.hero.flow.steps.2.body"),
      },
    ],
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

            <div className="lc-flow" data-lc-reveal>
              <span className="lc-sr-only">{t("landingConcept.hero.flow.label")}</span>
              <div className="lc-flow__rail">
                {heroFlow.map((step, index) => (
                  <Fragment key={step.title}>
                    <article className="lc-flow__step" aria-label={step.title}>
                      <div className="lc-flow__step-top">
                        <div className="lc-flow__step-index">0{index + 1}</div>
                        <div className="lc-flow__step-label">{step.title}</div>
                      </div>
                      <div className={`lc-flow__art lc-flow__art--${index + 1}`} aria-hidden="true">
                        {index === 0 ? (
                          <div className="lc-flow__art-form">
                            <span className="lc-flow__art-line lc-flow__art-line--long" />
                            <span className="lc-flow__art-line" />
                            <span className="lc-flow__art-line lc-flow__art-line--mid" />
                            <span className="lc-flow__art-chip" />
                            <span className="lc-flow__art-cursor" />
                          </div>
                        ) : index === 1 ? (
                          <div className="lc-flow__art-template">
                            <span className="lc-flow__art-card lc-flow__art-card--small" />
                            <span className="lc-flow__art-card lc-flow__art-card--tall" />
                            <span className="lc-flow__art-card lc-flow__art-card--small" />
                          </div>
                        ) : (
                          <div className="lc-flow__art-download">
                            <span className="lc-flow__art-file">
                              <i />
                              <i />
                              <i />
                            </span>
                            <span className="lc-flow__art-arrow" />
                          </div>
                        )}
                      </div>
                      <span className="lc-sr-only">{step.body}</span>
                    </article>
                    {index < heroFlow.length - 1 ? <div className="lc-flow__arrow" aria-hidden="true" /> : null}
                  </Fragment>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <LandingConceptQuestionnaire />
    </main>
  );
}

export default LandingConceptPage;
