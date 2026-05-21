import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./LegalPage.css";

type LegalPageProps = {
	kind: "privacy" | "terms";
};

function LegalPage({ kind }: LegalPageProps) {
	const { t } = useTranslation();
	const title = t(`legal.${kind}.title`);
	const subtitle = t(`legal.${kind}.subtitle`);
	const sections = t(`legal.${kind}.sections`, {
		returnObjects: true,
	}) as Array<{ title: string; body: string }>;

	return (
		<div className="rezynt-legal">
			<div className="rezynt-legal__frame">
				<Link to="/" className="rezynt-legal__back">
					{t("legal.back")}
				</Link>

				<div className="rezynt-kicker rezynt-legal__kicker">
					{t(`legal.${kind}.badge`)}
				</div>
				<h1>{title}</h1>
				<p className="rezynt-legal__subtitle">{subtitle}</p>

				<div className="rezynt-legal__sections">
					{sections.map((section) => (
						<section key={section.title} className="rezynt-legal__section">
							<h2>{section.title}</h2>
							<p>{section.body}</p>
						</section>
					))}
				</div>
			</div>
		</div>
	);
}

export default LegalPage;
