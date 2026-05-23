import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resumeApi } from "../../shared/services/api";
import { COLORS } from "../../shared/theme/theme";
import "./LandingPage.css";

type CopyItem = {
  title: string;
  body: string;
};

type MediaItem = {
  src: string;
  altKey: string;
};

const landingVars: React.CSSProperties & Record<string, string> = {
  "--landing-bg": COLORS.landing.background,
  "--landing-bg-alt": COLORS.landing.backgroundAlt,
  "--landing-surface": COLORS.landing.surface,
  "--landing-surface-strong": COLORS.landing.surfaceStrong,
  "--landing-text": COLORS.landing.text,
  "--landing-muted": COLORS.landing.mutedText,
  "--landing-accent": COLORS.landing.accent,
  "--landing-accent-alt": COLORS.landing.accentAlt,
  "--landing-border": COLORS.landing.border,
  "--landing-border-soft": COLORS.landing.borderSoft,
  "--landing-shadow": COLORS.landing.shadow,
  "--landing-shadow-hover": COLORS.landing.shadowHover,
  "--landing-shadow-strong": COLORS.landing.shadowStrong,
  "--landing-shadow-strong-hover": COLORS.landing.shadowStrongHover,
  "--landing-shadow-badge": COLORS.landing.shadowBadge,
  "--landing-shadow-badge-hover": COLORS.landing.shadowBadgeHover,
  "--landing-shadow-image": COLORS.landing.shadowImage,
  "--landing-shadow-image-hover": COLORS.landing.shadowImageHover,
  "--landing-shadow-card": COLORS.landing.shadowCard,
  "--landing-shadow-overlay": COLORS.landing.shadowOverlay,
  "--landing-shadow-overlay-soft": COLORS.landing.shadowOverlaySoft,
  "--landing-shadow-button": COLORS.landing.shadowButton,
  "--landing-shadow-button-hover": COLORS.landing.shadowButtonHover,
  "--landing-shadow-success": COLORS.landing.shadowSuccess,
  "--landing-gradient": COLORS.landing.gradient,
  "--landing-gradient-soft": COLORS.landing.gradientSoft,
  "--landing-mask-fade": COLORS.landing.maskFade,
  "--landing-blush": COLORS.landing.blush,
  "--landing-lavender": COLORS.landing.lavender,
  "--landing-blue-tint": COLORS.landing.blueTint,
  "--landing-gold": COLORS.landing.gold,
  "--landing-gold-dark": COLORS.landing.goldDark,
  "--landing-brown": COLORS.landing.brown,
  "--landing-cream": COLORS.landing.cream,
  "--landing-cream-border": COLORS.landing.creamBorder,
  "--landing-success": COLORS.landing.success,
  "--landing-danger": COLORS.landing.danger,
};

const revealStyle = { "--reveal-delay": "60ms" } as React.CSSProperties & Record<string, string>;

const uploadedFileExtensions = ["pdf", "doc", "docx"];

const painPointMedia: MediaItem[] = [
  { src: "/job-search-frustration.png", altKey: "landing.pain.items.0.title" },
  { src: "/no-response-call.png", altKey: "landing.pain.items.1.title" },
  { src: "/hourglass-money-loss.png", altKey: "landing.pain.items.2.title" },
];

const benefitMedia: MediaItem[] = [
  { src: "/resume-lightning-icon.png", altKey: "landing.benefits.items.0.title" },
  { src: "/ai-robot-edit-icon.png", altKey: "landing.benefits.items.1.title" },
  { src: "/resume-insights-lamp-icon.png", altKey: "landing.benefits.items.2.title" },
  { src: "/resume-magicwand-icon.png", altKey: "landing.benefits.items.3.title" },
  { src: "/resume-key-icon.png", altKey: "landing.benefits.items.4.title" },
  { src: "/resume-target-icon.png", altKey: "landing.benefits.items.5.title" },
];

function buildRefineRedirect(taskId: string) {
  const refinePath = `/refine?analyzing=true&taskId=${encodeURIComponent(taskId)}`;
  return `/onboarding?redirect=${encodeURIComponent(refinePath)}`;
}

function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const painPoints = useMemo<CopyItem[]>(
    () => [
      {
        title: t("landing.pain.items.0.title"),
        body: t("landing.pain.items.0.body"),
      },
      {
        title: t("landing.pain.items.1.title"),
        body: t("landing.pain.items.1.body"),
      },
      {
        title: t("landing.pain.items.2.title"),
        body: t("landing.pain.items.2.body"),
      },
    ],
    [t],
  );

  const processSteps = useMemo<CopyItem[]>(
    () => [
      {
        title: t("landing.process.items.0.title"),
        body: t("landing.process.items.0.body"),
      },
      {
        title: t("landing.process.items.1.title"),
        body: t("landing.process.items.1.body"),
      },
      {
        title: t("landing.process.items.2.title"),
        body: t("landing.process.items.2.body"),
      },
      {
        title: t("landing.process.items.3.title"),
        body: t("landing.process.items.3.body"),
      },
    ],
    [t],
  );

  const benefits = useMemo<CopyItem[]>(
    () => [
      {
        title: t("landing.benefits.items.0.title"),
        body: t("landing.benefits.items.0.body"),
      },
      {
        title: t("landing.benefits.items.1.title"),
        body: t("landing.benefits.items.1.body"),
      },
      {
        title: t("landing.benefits.items.2.title"),
        body: t("landing.benefits.items.2.body"),
      },
      {
        title: t("landing.benefits.items.3.title"),
        body: t("landing.benefits.items.3.body"),
      },
      {
        title: t("landing.benefits.items.4.title"),
        body: t("landing.benefits.items.4.body"),
      },
      {
        title: t("landing.benefits.items.5.title"),
        body: t("landing.benefits.items.5.body"),
      },
    ],
    [t],
  );

  const pricingFeatures = useMemo(
    () => [
      t("landing.pricing.features.0"),
      t("landing.pricing.features.1"),
      t("landing.pricing.features.2"),
      t("landing.pricing.features.3"),
    ],
    [t],
  );

  const uploadMessages = useMemo(
    () => [
      t("start.uploadMessages.0"),
      t("start.uploadMessages.1"),
      t("start.uploadMessages.2"),
      t("start.uploadMessages.3"),
      t("start.uploadMessages.4"),
      t("start.uploadMessages.5"),
      t("start.uploadMessages.6"),
      t("start.uploadMessages.7"),
      t("start.uploadMessages.8"),
      t("start.uploadMessages.9"),
      t("start.uploadMessages.10"),
      t("start.uploadMessages.11"),
      t("start.uploadMessages.12"),
      t("start.uploadMessages.13"),
      t("start.uploadMessages.14"),
    ],
    [t],
  );

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content");

    document.title = t("landing.meta.title");
    if (descriptionTag) {
      descriptionTag.setAttribute("content", t("landing.meta.description"));
    }

    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription) {
        descriptionTag.setAttribute("content", previousDescription);
      }
    };
  }, [t]);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>("[data-rezynt-reveal]");
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
        rootMargin: "0px 0px -60px 0px",
      },
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isUploading) {
      setStatusMessage("");
      return undefined;
    }

    let index = 0;
    setStatusMessage(uploadMessages[0]);
    const interval = window.setInterval(() => {
      index = (index + 1) % uploadMessages.length;
      setStatusMessage(uploadMessages[index]);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isUploading, uploadMessages]);

  const handleUpload = useCallback(
    async (file: File) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!uploadedFileExtensions.includes(extension)) {
        setErrorMessage(t("landing.hero.upload.allowedFormats"));
        return;
      }

      setErrorMessage("");
      setIsUploading(true);

      try {
        const { task_id } = await resumeApi.uploadResume(file);
        navigate(buildRefineRedirect(task_id), { replace: true });
      } catch (error) {
        console.error("Landing upload failed:", error);
        setErrorMessage(t("landing.hero.upload.error"));
      } finally {
        setIsUploading(false);
      }
    },
    [navigate, t],
  );

  const beginFileSelection = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleUpload(file);
      }
      event.target.value = "";
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        await handleUpload(file);
      }
    },
    [handleUpload],
  );

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      beginFileSelection();
    }
  }, [beginFileSelection]);

  return (
    <div className="rezynt-landing" style={landingVars}>
      <div className="rezynt-landing__aurora rezynt-landing__aurora--one" aria-hidden="true" />
      <div className="rezynt-landing__aurora rezynt-landing__aurora--two" aria-hidden="true" />
      <div className="rezynt-landing__grid" aria-hidden="true" />

      <header className="header">
        <div className="container">
          <div className="nav">
            <Link to="/" className="logo" aria-label="Резинт">
              <img src="/rezynt-logo-with-name.svg" alt="Резинт" className="logo-img" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero rezynt-reveal" style={revealStyle} data-rezynt-reveal>
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <div className="hero-badge">{t("landing.hero.badge")}</div>
                <h1 className="hero-title">{t("landing.hero.title")}</h1>
                <p className="hero-subtitle">
                  <span className="highlight">{t("landing.hero.subtitleLead")}</span>{" "}
                  {t("landing.hero.subtitleTail")}
                </p>

                <label
                  className={`hero-upload-area${isDragOver ? " hero-upload-area--dragover" : ""}${isUploading ? " hero-upload-area--loading" : ""}`}
                  id="hero-drop-area"
                  htmlFor="hero-upload"
                  tabIndex={0}
                  role="button"
                  aria-describedby="hero-upload-hint"
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setIsDragOver(false);
                    }
                  }}
                  onDrop={handleDrop}
                  onKeyDown={handleKeyDown}
                >
                  <span className="hero-upload-area__title">{t("landing.hero.upload.title")}</span>
                  <span className="hero-upload-area__subtitle" id="hero-upload-hint">
                    {t("landing.hero.upload.subtitle")}
                  </span>
                  <input
                    type="file"
                    id="hero-upload"
                    ref={fileInputRef}
                    className="hero-upload-area__input"
                    accept=".pdf,.doc,.docx"
                    aria-describedby="hero-upload-hint"
                    onChange={handleFileChange}
                  />
                  <div
                    className={`hero-upload-area__filename${errorMessage ? " hero-upload-area__filename--error" : ""}`}
                    aria-live="polite"
                  >
                    {errorMessage || statusMessage}
                  </div>
                  <div className={`hero-upload-area__spinner${isUploading ? " hero-upload-area__spinner--visible" : ""}`} aria-hidden="true" />
                </label>

                <p className="hero-upload-note">
                  {t("landing.hero.upload.notePrefix")}{" "}
                  <Link to="/start" className="hero-upload-note__link">
                    {t("landing.hero.upload.noteLink")}
                  </Link>
                </p>
              </div>

              <div className="hero-image" aria-hidden="true">
                <div className="resume-showcase">
                  <div className="resume-preview-main">
                    <img
                      src="/project-manager-resume-professional.png"
                      alt=""
                      className="resume-image"
                    />

                    <div className="sticker-badge sticker-top">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M16.7 5.3l-9.4 9.4-4-4"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{t("landing.hero.showcase.badges.top")}</span>
                    </div>
                    <div className="sticker-badge sticker-bottom">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M16.7 5.3l-9.4 9.4-4-4"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{t("landing.hero.showcase.badges.bottom")}</span>
                    </div>
                  </div>

                  <div className="score-badge">
                    <img
                      src="/score-badge-excelent.png"
                      alt={t("landing.hero.showcase.scoreAlt")}
                      className="score-badge-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pain-points rezynt-reveal" data-rezynt-reveal>
          <div className="container">
            <div className="pain-visual">
              <h2 className="section-title">{t("landing.pain.title")}</h2>
              <div className="pain-grid">
                {painPoints.map((item, index) => (
                  <article key={item.title} className="pain-item">
                    <div className="pain-icon">
                      <img src={painPointMedia[index].src} alt={t(painPointMedia[index].altKey)} className="pain-icon-img" />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="solution rezynt-reveal" data-rezynt-reveal>
          <div className="container">
            <h2 className="section-title">{t("landing.solution.text")}</h2>
          </div>
        </section>

        <section className="process rezynt-reveal" data-rezynt-reveal id="how-it-works">
          <div className="container">
            <div className="process-visual">
              <h2 className="section-title">{t("landing.process.title")}</h2>
              <p className="process-subtitle">{t("landing.process.subtitle")}</p>

              <div className="corner-text corner-top-left">
                <span className="corner-number">1</span>
                <h3>{processSteps[0].title}</h3>
                <p>{processSteps[0].body}</p>
              </div>

              <div className="corner-text corner-top-right">
                <span className="corner-number">2</span>
                <h3>{processSteps[1].title}</h3>
                <p>{processSteps[1].body}</p>
              </div>

              <div className="central-illustration">
                <div className="resume-preview">
                  <img
                    src="/project-manager-resume-professional.png"
                    alt={t("landing.process.visual.title")}
                    className="resume-img"
                  />
                </div>

                <div className="score-overlay score-low">
                  <img
                    src="/score-badge-weak.png"
                    alt={t("landing.process.visual.lowScoreAlt")}
                    className="score-badge-overlay-img"
                  />
                </div>

                <div className="score-overlay score-high">
                  <img
                    src="/score-badge-excelent.png"
                    alt={t("landing.process.visual.highScoreAlt")}
                    className="score-badge-overlay-img"
                  />
                </div>

                <div className="improvement-overlay">
                  <img
                    src="/improvement-missing-skills.png"
                    alt={t("landing.process.visual.improvementAlt")}
                    className="improvement-img"
                  />
                </div>
              </div>

              <div className="corner-text corner-bottom-left">
                <span className="corner-number">3</span>
                <h3>{processSteps[2].title}</h3>
                <p>{processSteps[2].body}</p>
              </div>

              <div className="corner-text corner-bottom-right">
                <span className="corner-number">4</span>
                <h3>{processSteps[3].title}</h3>
                <p>{processSteps[3].body}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="what-you-get rezynt-reveal" data-rezynt-reveal>
          <div className="container">
            <h2 className="section-title">{t("landing.benefits.title")}</h2>

            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <article key={benefit.title} className="benefit-item">
                  <div className="benefit-icon">
                    <img src={benefitMedia[index].src} alt={t(benefitMedia[index].altKey)} />
                  </div>
                  <div className="benefit-content">
                    <h3>{benefit.title}</h3>
                    <p>{benefit.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing rezynt-reveal" data-rezynt-reveal>
          <div className="container">
            <div className="pricing-header">
              <h2 className="pricing-title">{t("landing.pricing.title")}</h2>
              <p className="pricing-subtitle">{t("landing.pricing.subtitle")}</p>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-left">
                <div className="pricing-resume-preview">
                  <img
                    src="/project-manager-resume-professional.png"
                    alt={t("landing.pricing.previewAlt")}
                    className="pricing-resume-image"
                  />
                  <div className="pricing-score-badge">
                    <img
                      src="/score-badge-excelent.png"
                      alt={t("landing.pricing.scoreAlt")}
                      className="pricing-score-img"
                    />
                  </div>
                </div>
              </div>

              <div className="pricing-card-right">
                <div className="pricing-price">
                  <span className="price-amount">{t("landing.pricing.price")}</span>
                  <span className="price-period">{t("landing.pricing.period")}</span>
                </div>
                <p className="pricing-terms">{t("landing.pricing.terms")}</p>

                <div className="pricing-features">
                  {pricingFeatures.map((feature) => (
                    <div key={feature} className="feature-item">
                      <span className="feature-check">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/start" className="pricing-cta">
                  {t("landing.pricing.cta")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-logo">
              <img src="/rezynt-logo-with-name.svg" alt="Резинт" className="footer-logo-img" />
            </div>
            <p className="footer-copyright">{t("landing.footer.copy")}</p>
          </div>
          <div className="footer-divider" />
          <div className="footer-bottom">
            <div className="footer-contact">
              <a href="mailto:team@rezynt.com">{t("landing.footer.email")}</a>
            </div>
            <div className="footer-links">
              <Link to="/privacy-policy.html">{t("landing.footer.links.privacy")}</Link>
              <Link to="/terms-of-service.html">{t("landing.footer.links.terms")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
