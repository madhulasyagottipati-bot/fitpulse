import React from 'react';

export default function HeroIllustration() {
  return (
    <svg
      className="fp-hero-illustration"
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fpHeroLine" x1="12" y1="120" x2="228" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="55%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="fpHeroFill" x1="120" y1="26" x2="120" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Ambient rings */}
      <circle cx="176" cy="54" r="42" stroke="#38BDF8" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="176" cy="54" r="26" stroke="#22C55E" strokeOpacity="0.32" strokeWidth="2" />
      <circle cx="54" cy="128" r="24" fill="#22C55E" fillOpacity="0.09" />

      {/* Subtle grid lines */}
      <path d="M18 144H224" stroke="#94A3B8" strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 108H224" stroke="#94A3B8" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 5" />
      <path d="M18 72H224" stroke="#94A3B8" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 5" />

      {/* Performance area fill */}
      <path
        d="M22 134 C48 128, 62 94, 86 98 C108 102, 120 62, 146 66 C168 70, 182 32, 218 38 L218 144 L22 144 Z"
        fill="url(#fpHeroFill)"
      />

      {/* Pulse waveform */}
      <path
        d="M22 134 C48 128, 62 94, 86 98 C108 102, 120 62, 146 66 C168 70, 182 32, 218 38"
        stroke="url(#fpHeroLine)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Data checkpoints */}
      <circle cx="86" cy="98" r="5" fill="#0B1220" stroke="#22C55E" strokeWidth="3" />
      <circle cx="146" cy="66" r="5.5" fill="#0B1220" stroke="#38BDF8" strokeWidth="3" />
      <circle cx="218" cy="38" r="6" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* Heartbeat pulse badge */}
      <rect x="26" y="22" width="84" height="32" rx="11" fill="#172033" fillOpacity="0.92" stroke="#38BDF8" strokeOpacity="0.35" />
      <path
        d="M36 38H44L48 29L54 46L59 35L63 38H70"
        stroke="#22C55E"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="77" y="42" fill="#FFFFFF" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">
        SYNC
      </text>
    </svg>
  );
}
