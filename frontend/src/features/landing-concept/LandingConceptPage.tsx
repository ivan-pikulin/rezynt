import type React from "react";
import { Fragment, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../shared/theme/theme";
import "./LandingConceptPage.css";

type CardCopy = {
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

  const painItems = useMemo<CardCopy[]>(
    () => [
      {
        title: t("landingConcept.pain.items.0.title"),
        body: t("landingConcept.pain.items.0.body"),
      },
      {
        title: t("landingConcept.pain.items.1.title"),
        body: t("landingConcept.pain.items.1.body"),
      },
      {
        title: t("landingConcept.pain.items.2.title"),
        body: t("landingConcept.pain.items.2.body"),
      },
    ],
    [t],
  );

  const benefitItems = useMemo<CardCopy[]>(
    () => [
      {
        title: t("landingConcept.benefits.items.0.title"),
        body: t("landingConcept.benefits.items.0.body"),
      },
      {
        title: t("landingConcept.benefits.items.1.title"),
        body: t("landingConcept.benefits.items.1.body"),
      },
      {
        title: t("landingConcept.benefits.items.2.title"),
        body: t("landingConcept.benefits.items.2.body"),
      },
      {
        title: t("landingConcept.benefits.items.3.title"),
        body: t("landingConcept.benefits.items.3.body"),
      },
    ],
    [t],
  );

  const productSteps = useMemo<CardCopy[]>(
    () => [
      {
        title: t("landingConcept.product.steps.0.title"),
        body: t("landingConcept.product.steps.0.body"),
      },
      {
        title: t("landingConcept.product.steps.1.title"),
        body: t("landingConcept.product.steps.1.body"),
      },
      {
        title: t("landingConcept.product.steps.2.title"),
        body: t("landingConcept.product.steps.2.body"),
      },
      {
        title: t("landingConcept.product.steps.3.title"),
        body: t("landingConcept.product.steps.3.body"),
      },
    ],
    [t],
  );

  const offerBullets = useMemo(
    () => [
      t("landingConcept.offer.items.0"),
      t("landingConcept.offer.items.1"),
      t("landingConcept.offer.items.2"),
    ],
    [t],
  );

  const heroBadges = useMemo(
    () => [
      t("landingConcept.hero.badges.1"),
      t("landingConcept.hero.badges.2"),
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
            <a href="#pain">{t("landingConcept.nav.pain")}</a>
            <a href="#benefits">{t("landingConcept.nav.benefits")}</a>
            <a href="#product">{t("landingConcept.nav.product")}</a>
            <a href="#offer">{t("landingConcept.nav.offer")}</a>
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
                        <div className="lc-flow__step-visual" aria-hidden="true" />
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
                      <div className="lc-flow__caption">{step.title}</div>
                      <span className="lc-sr-only">{step.body}</span>
                    </article>
                    {index < heroFlow.length - 1 ? <div className="lc-flow__arrow" aria-hidden="true" /> : null}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="lc-hero__stats">
              {[0, 1, 2].map((index) => (
                <article key={index} className="lc-stat">
                  <div className="lc-stat__value">{t(`landingConcept.hero.stats.${index}.value`)}</div>
                  <div className="lc-stat__label">{t(`landingConcept.hero.stats.${index}.label`)}</div>
                </article>
              ))}
            </div>
          </div>

          <div className="lc-hero__visual" data-lc-reveal>
            <div className="lc-desk">
              <div className="lc-paper">
                <div className="lc-paper__top">
                  <div>
                    <div className="lc-paper__eyebrow">{t("landingConcept.hero.mock.eyebrow")}</div>
                    <div className="lc-paper__title">{t("landingConcept.hero.mock.title")}</div>
                  </div>
                  <div className="lc-score">
                    <span className="lc-score__label">{t("landingConcept.hero.mock.scoreLabel")}</span>
                    <span className="lc-score__value">{t("landingConcept.hero.mock.scoreValue")}</span>
                  </div>
                </div>

                <div className="lc-paper__lines">
                  <span className="lc-paper__line lc-paper__line--wide" />
                  <span className="lc-paper__line" />
                  <span className="lc-paper__line lc-paper__line--short" />
                </div>

                <div className="lc-paper__footer">
                  <span>{t("landingConcept.hero.mock.footerLeft")}</span>
                  <span>{t("landingConcept.hero.mock.footerRight")}</span>
                </div>
              </div>

              <div className="lc-note lc-note--top">{t("landingConcept.hero.mock.noteTop")}</div>
              <div className="lc-note lc-note--bottom">{t("landingConcept.hero.mock.noteBottom")}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pain" className="lc-section lc-section--soft">
        <div className="lc-shell">
          <div className="lc-section__head" data-lc-reveal>
            <div className="lc-section__eyebrow">{t("landingConcept.pain.eyebrow")}</div>
            <h2 className="lc-section__title">{t("landingConcept.pain.title")}</h2>
            <p className="lc-section__lead">{t("landingConcept.pain.subtitle")}</p>
          </div>

          <div className="lc-pain-grid">
            {painItems.map((item, index) => (
              <article className="lc-card lc-pain-card" key={item.title} data-lc-reveal style={{ "--lc-delay": `${index * 90}ms` } as React.CSSProperties & Record<string, string>}>
                <div className="lc-card__index">0{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="lc-section">
        <div className="lc-shell lc-benefits">
          <div className="lc-section__head" data-lc-reveal>
            <div className="lc-section__eyebrow">{t("landingConcept.benefits.eyebrow")}</div>
            <h2 className="lc-section__title">{t("landingConcept.benefits.title")}</h2>
            <p className="lc-section__lead">{t("landingConcept.benefits.subtitle")}</p>
          </div>

          <div className="lc-benefits__grid">
            {benefitItems.map((item, index) => (
              <article className="lc-card lc-benefit-card" key={item.title} data-lc-reveal style={{ "--lc-delay": `${index * 80}ms` } as React.CSSProperties & Record<string, string>}>
                <div className="lc-benefit-card__tag">{t(`landingConcept.benefits.items.${index}.tag`)}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="lc-section lc-section--product">
        <div className="lc-shell lc-product">
          <div className="lc-product__copy" data-lc-reveal>
            <div className="lc-section__eyebrow">{t("landingConcept.product.eyebrow")}</div>
            <h2 className="lc-section__title">{t("landingConcept.product.title")}</h2>
            <p className="lc-section__lead">{t("landingConcept.product.subtitle")}</p>

            <div className="lc-product__steps">
              {productSteps.map((step, index) => (
                <article className="lc-step" key={step.title}>
                  <div className="lc-step__marker">0{index + 1}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="lc-product__visual" data-lc-reveal>
            <div className="lc-analysis">
              <div className="lc-analysis__rail">
                <div className="lc-analysis__chip">{t("landingConcept.product.mock.railTop")}</div>
                <div className="lc-analysis__score">
                  <span>{t("landingConcept.product.mock.scoreLabel")}</span>
                  <strong>{t("landingConcept.product.mock.scoreValue")}</strong>
                </div>
                <div className="lc-analysis__bars">
              {[0, 1, 2].map((index) => (
                <div className="lc-analysis__bar" key={index}>
                  <span>{t(`landingConcept.product.mock.metrics.${index}.label`)}</span>
                  <div className="lc-analysis__track">
                    <i style={{ width: t(`landingConcept.product.mock.metrics.${index}.width`) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lc-sheet">
                <div className="lc-sheet__head">
                  <div>
                    <div className="lc-sheet__eyebrow">{t("landingConcept.product.mock.sheetEyebrow")}</div>
                    <div className="lc-sheet__title">{t("landingConcept.product.mock.sheetTitle")}</div>
                  </div>
                  <div className="lc-sheet__pill">{t("landingConcept.product.mock.sheetPill")}</div>
                </div>

                <div className="lc-sheet__sections">
                  {[0, 1, 2].map((index) => (
                    <div className="lc-sheet__section" key={index}>
                      <div className="lc-sheet__label">{t(`landingConcept.product.mock.sections.${index}.label`)}</div>
                      <div className="lc-sheet__line lc-sheet__line--wide" />
                      <div className="lc-sheet__line" />
                      <div className="lc-sheet__line lc-sheet__line--short" />
                    </div>
                  ))}
                </div>

                <div className="lc-sheet__footer">
                  <span>{t("landingConcept.product.mock.footerLeft")}</span>
                  <span>{t("landingConcept.product.mock.footerRight")}</span>
                </div>
              </div>

              <div className="lc-floating lc-floating--left">{t("landingConcept.product.mock.noteLeft")}</div>
              <div className="lc-floating lc-floating--right">{t("landingConcept.product.mock.noteRight")}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="offer" className="lc-section lc-section--offer">
        <div className="lc-shell">
          <div className="lc-offer" data-lc-reveal>
            <div className="lc-offer__copy">
              <div className="lc-section__eyebrow">{t("landingConcept.offer.eyebrow")}</div>
              <h2 className="lc-section__title">{t("landingConcept.offer.title")}</h2>
              <p className="lc-section__lead">{t("landingConcept.offer.subtitle")}</p>
            </div>

            <div className="lc-offer__panel">
              <ul className="lc-offer__list">
                {offerBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p className="lc-offer__note">{t("landingConcept.offer.note")}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="lc-footer">
        <div className="lc-shell lc-footer__inner">
          <img
            src="/rezynt-logo-with-name.svg"
            alt="Rezynt"
            className="lc-footer__brand"
            width="206"
            height="52"
          />
          <div className="lc-footer__links">
            <a href="mailto:team@rezynt.com">{t("landingConcept.footer.email")}</a>
            <Link to="/privacy-policy.html">{t("landingConcept.footer.links.privacy")}</Link>
            <Link to="/terms-of-service.html">{t("landingConcept.footer.links.terms")}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingConceptPage;
