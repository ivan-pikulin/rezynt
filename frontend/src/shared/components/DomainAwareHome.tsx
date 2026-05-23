import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import GradientSpinnerAnimation from "./GradientSpinnerAnimation";
import HomeRedirect from "./HomeRedirect";
import LandingConceptPage from "../../features/landing-concept/LandingConceptPage";

type HomeVariant = "landing" | "app";

function resolveHomeVariant(): HomeVariant {
	if (typeof window === "undefined") {
		return "landing";
	}

	const host = window.location.hostname;
	if (host === "app.rezynt.ru" || host === "app.rezynt.com") {
		return "app";
	}

	return "landing";
}

const DomainAwareHome: React.FC = () => {
	const [variant, setVariant] = useState<HomeVariant | null>(null);

	useEffect(() => {
		setVariant(resolveHomeVariant());
	}, []);

	if (!variant) {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					bgcolor: "#fef1f1",
				}}
			>
				<GradientSpinnerAnimation size={40} />
			</Box>
		);
	}

	return variant === "landing" ? <LandingConceptPage /> : <HomeRedirect />;
};

export default DomainAwareHome;
