/** Lightweight pastel SVG illustrations — no external dependencies */

export function ReceiptIllustration({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect x="18" y="8" width="44" height="60" rx="6" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
      <path d="M18 62 l5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 4 5V62z" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" strokeLinejoin="round" />
      <rect x="28" y="20" width="24" height="3" rx="1.5" fill="#a78bfa" opacity="0.6" />
      <rect x="28" y="28" width="18" height="3" rx="1.5" fill="#c4b5fd" opacity="0.5" />
      <rect x="28" y="36" width="20" height="3" rx="1.5" fill="#c4b5fd" opacity="0.5" />
      <rect x="28" y="44" width="14" height="3" rx="1.5" fill="#c4b5fd" opacity="0.5" />
      <circle cx="58" cy="16" r="10" fill="#f9a8d4" opacity="0.3" />
      <path d="M55 16l2 2 4-4" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrainIllustration({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="36" r="22" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
      <path d="M32 30c0-4 3-7 8-7s8 3 8 7" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 38c0 5 5 10 12 10s12-5 12-10" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="29" x2="40" y2="48" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="35" r="2" fill="#a78bfa" />
      <circle cx="46" cy="35" r="2" fill="#a78bfa" />
      {/* sparkles */}
      <circle cx="18" cy="20" r="3" fill="#fde68a" opacity="0.7" />
      <circle cx="62" cy="22" r="2.5" fill="#f9a8d4" opacity="0.6" />
      <circle cx="58" cy="52" r="2" fill="#93c5fd" opacity="0.6" />
      <path d="M22 52l2-4 2 4-4-2 4 0z" fill="#a78bfa" opacity="0.5" />
    </svg>
  );
}

export function ChartIllustration({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect x="10" y="12" width="60" height="52" rx="8" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="2" />
      {/* bars */}
      <rect x="22" y="42" width="8" height="14" rx="2" fill="#6ee7b7" />
      <rect x="34" y="32" width="8" height="24" rx="2" fill="#34d399" />
      <rect x="46" y="38" width="8" height="18" rx="2" fill="#6ee7b7" />
      <rect x="58" y="26" width="8" height="30" rx="2" fill="#34d399" />
      {/* trend line */}
      <path d="M26 38 L38 28 L50 34 L62 22" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="38" r="2.5" fill="#059669" />
      <circle cx="38" cy="28" r="2.5" fill="#059669" />
      <circle cx="50" cy="34" r="2.5" fill="#059669" />
      <circle cx="62" cy="22" r="2.5" fill="#059669" />
    </svg>
  );
}

export function RocketIllustration({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* flame */}
      <ellipse cx="40" cy="66" rx="6" ry="8" fill="#fde68a" opacity="0.7" />
      <ellipse cx="40" cy="64" rx="4" ry="6" fill="#fdba74" opacity="0.8" />
      {/* body */}
      <path d="M32 54 L40 14 L48 54 Z" fill="#ede9fe" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
      {/* nose */}
      <ellipse cx="40" cy="22" rx="4" ry="6" fill="#a78bfa" opacity="0.4" />
      {/* window */}
      <circle cx="40" cy="36" r="5" fill="white" stroke="#a78bfa" strokeWidth="2" />
      <circle cx="40" cy="36" r="2.5" fill="#c4b5fd" />
      {/* fins */}
      <path d="M32 48 L24 56 L32 54Z" fill="#f9a8d4" stroke="#f472b6" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M48 48 L56 56 L48 54Z" fill="#f9a8d4" stroke="#f472b6" strokeWidth="1.5" strokeLinejoin="round" />
      {/* stars */}
      <circle cx="16" cy="24" r="2" fill="#fde68a" opacity="0.6" />
      <circle cx="64" cy="18" r="1.5" fill="#93c5fd" opacity="0.6" />
      <circle cx="20" cy="48" r="1.5" fill="#f9a8d4" opacity="0.5" />
      <circle cx="62" cy="42" r="2" fill="#c4b5fd" opacity="0.5" />
    </svg>
  );
}

export function NotesIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      {/* clipboard */}
      <rect x="40" y="30" width="80" height="105" rx="10" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
      <rect x="56" y="24" width="48" height="14" rx="7" fill="#c4b5fd" />
      <circle cx="80" cy="31" r="4" fill="#a78bfa" />
      {/* lines */}
      <rect x="54" y="56" width="52" height="4" rx="2" fill="#c4b5fd" opacity="0.5" />
      <rect x="54" y="68" width="40" height="4" rx="2" fill="#c4b5fd" opacity="0.4" />
      <rect x="54" y="80" width="46" height="4" rx="2" fill="#c4b5fd" opacity="0.4" />
      <rect x="54" y="92" width="32" height="4" rx="2" fill="#c4b5fd" opacity="0.3" />
      {/* pencil */}
      <g transform="translate(108, 90) rotate(30)">
        <rect x="0" y="0" width="6" height="36" rx="1" fill="#fde68a" stroke="#fbbf24" strokeWidth="1" />
        <polygon points="0,36 6,36 3,44" fill="#f9a8d4" />
        <rect x="0" y="0" width="6" height="6" rx="1" fill="#fca5a5" />
      </g>
      {/* decorative dots */}
      <circle cx="30" cy="50" r="4" fill="#f9a8d4" opacity="0.3" />
      <circle cx="135" cy="60" r="3" fill="#93c5fd" opacity="0.3" />
      <circle cx="36" cy="120" r="3" fill="#fde68a" opacity="0.4" />
    </svg>
  );
}

export function HeroIllustration({ size = 400 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" fill="none">
      {/* Background circle */}
      <circle cx="200" cy="200" r="160" fill="#f5eeff" />
      <circle cx="200" cy="200" r="130" fill="#ede9fe" opacity="0.5" />

      {/* Phone body */}
      <rect x="145" y="80" width="110" height="220" rx="18" fill="white" stroke="#c4b5fd" strokeWidth="3" />
      <rect x="155" y="100" width="90" height="180" rx="4" fill="#faf5ff" />

      {/* Screen content — mini chart */}
      <rect x="165" y="115" width="70" height="10" rx="3" fill="#a78bfa" opacity="0.3" />
      <rect x="165" y="135" width="14" height="40" rx="3" fill="#6ee7b7" />
      <rect x="183" y="145" width="14" height="30" rx="3" fill="#a78bfa" />
      <rect x="201" y="125" width="14" height="50" rx="3" fill="#f9a8d4" />
      <rect x="219" y="140" width="14" height="35" rx="3" fill="#fde68a" />

      {/* Screen content — lines */}
      <rect x="165" y="190" width="60" height="6" rx="3" fill="#c4b5fd" opacity="0.4" />
      <rect x="165" y="202" width="45" height="6" rx="3" fill="#c4b5fd" opacity="0.3" />
      <rect x="165" y="214" width="55" height="6" rx="3" fill="#c4b5fd" opacity="0.3" />

      {/* Screen content — total */}
      <rect x="165" y="234" width="70" height="20" rx="6" fill="#ede9fe" />
      <rect x="172" y="240" width="40" height="8" rx="3" fill="#a78bfa" opacity="0.6" />

      {/* Phone notch */}
      <rect x="180" y="85" width="40" height="8" rx="4" fill="#e9e5f0" />

      {/* Floating receipt card — left */}
      <g transform="translate(50, 140)">
        <rect width="80" height="100" rx="10" fill="white" stroke="#f9a8d4" strokeWidth="2" />
        <rect x="12" y="14" width="56" height="6" rx="3" fill="#f9a8d4" opacity="0.4" />
        <rect x="12" y="26" width="40" height="5" rx="2.5" fill="#fce7f3" />
        <rect x="12" y="36" width="48" height="5" rx="2.5" fill="#fce7f3" />
        <rect x="12" y="46" width="36" height="5" rx="2.5" fill="#fce7f3" />
        <rect x="12" y="62" width="56" height="12" rx="4" fill="#f9a8d4" opacity="0.15" />
        <rect x="18" y="66" width="30" height="4" rx="2" fill="#f472b6" opacity="0.5" />
        <path d="M0 80 l8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8V80z" fill="white" stroke="#f9a8d4" strokeWidth="1.5" />
      </g>

      {/* Floating insight card — right */}
      <g transform="translate(270, 120)">
        <rect width="90" height="70" rx="10" fill="white" stroke="#6ee7b7" strokeWidth="2" />
        <circle cx="22" cy="22" r="10" fill="#ecfdf5" />
        <path d="M18 22l3 3 5-6" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="40" y="17" width="38" height="5" rx="2.5" fill="#6ee7b7" opacity="0.4" />
        <rect x="40" y="27" width="28" height="4" rx="2" fill="#d1fae5" />
        <rect x="12" y="44" width="66" height="12" rx="4" fill="#ecfdf5" />
        <rect x="18" y="48" width="36" height="4" rx="2" fill="#34d399" opacity="0.5" />
      </g>

      {/* Floating sparkle card — bottom right */}
      <g transform="translate(280, 250)">
        <rect width="75" height="55" rx="10" fill="white" stroke="#fde68a" strokeWidth="2" />
        <circle cx="20" cy="20" r="8" fill="#fef9c3" />
        <path d="M20 14v12M14 20h12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <rect x="36" y="15" width="28" height="5" rx="2.5" fill="#fde68a" opacity="0.5" />
        <rect x="36" y="24" width="20" height="4" rx="2" fill="#fef9c3" />
        <rect x="12" y="38" width="50" height="4" rx="2" fill="#fde68a" opacity="0.3" />
      </g>

      {/* Decorative circles */}
      <circle cx="80" cy="100" r="8" fill="#f9a8d4" opacity="0.25" />
      <circle cx="340" cy="90" r="6" fill="#93c5fd" opacity="0.25" />
      <circle cx="60" cy="280" r="10" fill="#fde68a" opacity="0.2" />
      <circle cx="350" cy="320" r="7" fill="#c4b5fd" opacity="0.25" />
      <circle cx="320" cy="200" r="4" fill="#6ee7b7" opacity="0.3" />
    </svg>
  );
}
