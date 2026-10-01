import type { MoodTag } from '../movie-library';

/** Decorative line faces inherit the option's foreground, including selected black. */
export function MoodExpression({ mood }: { mood: MoodTag }) {
  const closedEyes = mood === 'relaxed' || mood === 'healing' || mood === 'nostalgic';
  const sadEyes = mood === 'sad' || mood === 'gloomy';
  return (
    <span className={`mood-expression mood-expression-${mood}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <g className="mood-face">
          <circle cx="20" cy="20" r="12.5" />
          <g className="mood-eyes">
            {mood === 'romantic' ? <path className="mood-heart" d="M12 16c-2-3 1-5 3-2 2-3 5-1 3 2l-3 3Zm10 0c-2-3 1-5 3-2 2-3 5-1 3 2l-3 3Z" />
              : closedEyes ? <path d="M12 18q3 3 6 0m4 0q3 3 6 0" />
              : sadEyes ? <path d="m12 16 5-2m6 0 5 2m-13 2v2m10-2v2" />
              : mood === 'excited' ? <path d="m12 18 3-3 3 3m4 0 3-3 3 3" />
              : <path d="M15 16v3m10-3v3" />}
          </g>
          {mood === 'sad' || mood === 'gloomy' ? <path d="M16 27q4-4 8 0" />
            : mood === 'tense' ? <path d="m15 26 2-2 2 2 2-2 2 2 2-2" />
            : mood === 'lonely' ? <path d="M17 26h6" />
            : mood === 'excited' ? <path d="M14 23h12q-1 8-6 8t-6-8Z" />
            : <path d="M15 24q5 5 10 0" />}
        </g>
        {mood === 'sad' && <><path className="mood-tear" d="M13 21q-4 5 0 5t0-5Z" /><path className="mood-tear mood-tear-late" d="M27 21q-4 5 0 5t0-5Z" /></>}
        {mood === 'tense' && <path className="mood-sweat" d="M32 8q-4 5 0 5t0-5Z" />}
        {mood === 'healing' && <path className="mood-spark" d="M32 2v8m-4-4h8M6 28v6m-3-3h6" />}
        {mood === 'gloomy' && <g className="mood-cloud"><path d="M6 8C1 8 2 2 6 3c1-4 7-3 7 0 5-1 5 5 1 5Z" /><path d="m5 11-1 2m7-2-1 2" /></g>}
        {mood === 'nostalgic' && <path className="mood-memory" d="M29 5h6m-3-3v6" />}
      </svg>
    </span>
  );
}
