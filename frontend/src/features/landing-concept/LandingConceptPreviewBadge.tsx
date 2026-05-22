type LandingConceptPreviewBadgeProps = {
  labels: string[];
};

function LandingConceptPreviewBadge(props: LandingConceptPreviewBadgeProps) {
  return (
    <div className="lc-resume-showcase__badges" aria-label={props.labels.join(", ")}>
      {props.labels.map((label) => (
        <div key={label} className="lc-resume-showcase__badge">
          <span className="lc-resume-showcase__badge-check" aria-hidden="true">
            ✓
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default LandingConceptPreviewBadge;
