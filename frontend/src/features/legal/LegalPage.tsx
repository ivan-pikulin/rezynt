import { Link } from "react-router-dom";
import type React from "react";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../shared/theme/theme";
import "./LegalPage.css";

type LegalPageProps = {
	kind: "privacy" | "terms";
};

type LegalSection = {
	title: string;
	body?: string;
	paragraphs?: string[];
	items?: string[];
};

function LegalPage({ kind }: LegalPageProps) {
	const { t } = useTranslation();
	const title = t(`legal.${kind}.title`);
	const subtitle = t(`legal.${kind}.subtitle`);
	const updatedAt = t(`legal.${kind}.updatedAt`, { defaultValue: "" });
	const sections = t(`legal.${kind}.sections`, {
		returnObjects: true,
	}) as LegalSection[];

	return (
		<div
			className="rezynt-legal"
			style={{
				"--legal-bg": COLORS.landing.background,
				"--legal-surface": COLORS.landing.surfaceStrong,
				"--legal-surface-muted": COLORS.landing.backgroundAlt,
				"--legal-text": COLORS.landing.text,
				"--legal-muted": COLORS.landing.mutedText,
				"--legal-accent": COLORS.landing.accent,
				"--legal-border": COLORS.landing.borderSoft,
				"--legal-shadow": COLORS.landing.shadow,
			} as React.CSSProperties}
		>
			<div className="rezynt-legal__frame">
				<header className="rezynt-legal__header">
					<Link to="/" className="rezynt-legal__brand" aria-label="Резинт">
						<img src="/rezynt-logo-with-name.svg" alt="Резинт" />
					</Link>

					<Link
						to="/"
						className="rezynt-legal__close"
						aria-label={t("legal.close", { defaultValue: t("legal.back") })}
					>
						<span aria-hidden="true" />
					</Link>
				</header>

				<main className="rezynt-legal__document">
					<h1>{title}</h1>
					<p className="rezynt-legal__subtitle">{subtitle}</p>

					{updatedAt && <p className="rezynt-legal__updated">{updatedAt}</p>}

					<div className="rezynt-legal__sections">
						{sections.map((section) => (
							<section key={section.title} className="rezynt-legal__section">
								<h2>{section.title}</h2>
								{section.body && <p>{section.body}</p>}
								{section.paragraphs?.map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
								{section.items && (
									<ul>
										{section.items.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
								)}
							</section>
						))}
					</div>
				</main>
			</div>

			<footer className="rezynt-legal__footer">
				<div className="rezynt-legal__footer-inner">
					<div className="rezynt-legal__footer-top">
						<img
							src="/rezynt-logo-with-name.svg"
							alt="Резинт"
							className="rezynt-legal__footer-logo"
						/>
						<p>{t("landing.footer.copy")}</p>
					</div>

					<div className="rezynt-legal__footer-divider" />

					<div className="rezynt-legal__footer-bottom">
						<a href={`mailto:${t("landing.footer.email")}`}>{t("landing.footer.email")}</a>
						<nav className="rezynt-legal__footer-links">
							<Link to="/privacy-policy.html">{t("landing.footer.links.privacy")}</Link>
							<Link to="/terms-of-service.html">{t("landing.footer.links.terms")}</Link>
						</nav>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default LegalPage;
