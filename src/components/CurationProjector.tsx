export function CurationProjector() {
  return (
    <svg className="curation-projector" viewBox="0 0 120 88" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <path className="projector-light" d="M85 45 115 30v42L85 57Z" fill="currentColor" stroke="none" />
      {[32, 64].map(cx => (
        <g className="projector-reel" key={cx} style={{ transformOrigin: `${cx}px 24px` }}>
          <circle cx={cx} cy="24" r="15" />
          <circle cx={cx} cy="24" r="2" />
          {[0, 90, 180, 270].map(angle => (
            <circle key={angle} cx={cx} cy="15" r="3.5" transform={`rotate(${angle} ${cx} 24)`} />
          ))}
        </g>
      ))}
      <rect x="22" y="41" width="52" height="26" rx="4" />
      <path d="m74 48 11-5v17l-11-5M35 67l-7 12m31-12 7 12M22 79h50M31 49h24m-24 6h15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
