"use client";

/**
 * HeroBackground
 *
 * A directional mesh gradient inspired by Cluely / Lovable.
 * Two palettes are rendered and cross-faded based on AI connection status:
 *   - connected:    calm Japanese sky-blue (seiji-iro)
 *   - disconnected: warm warning red-orange (signals "AI is offline")
 *
 * Pure CSS — no JS animation cost. Respects prefers-reduced-motion.
 */
export function HeroBackground({ connected = true }: { connected?: boolean }) {
  // Palette definitions kept inline so the component is self-contained.
  type Palette = { wash: string; mesh: string; glow: string };
  const palettes: { calm: Palette; alert: Palette } = {
    calm: {
      wash: "linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #f4f9fc 82%, #cfe1ee 93%, #6ba3cc 100%)",
      mesh: `
        radial-gradient(ellipse 90% 50% at 50% 130%, rgba(91, 155, 200, 0.55), transparent 60%),
        radial-gradient(ellipse 55% 40% at 80% 115%, rgba(120, 175, 213, 0.45), transparent 60%),
        radial-gradient(ellipse 60% 45% at 20% 120%, rgba(140, 190, 220, 0.40), transparent 65%)
      `,
      glow: "radial-gradient(circle, rgba(178, 213, 234, 0.55) 0%, rgba(120, 175, 213, 0.30) 40%, transparent 75%)",
    },
    alert: {
      wash: "linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #fff4ec 82%, #fcd5b8 93%, #e8743c 100%)",
      mesh: `
        radial-gradient(ellipse 90% 50% at 50% 130%, rgba(220, 90, 50, 0.55), transparent 60%),
        radial-gradient(ellipse 55% 40% at 80% 115%, rgba(232, 116, 60, 0.45), transparent 60%),
        radial-gradient(ellipse 60% 45% at 20% 120%, rgba(240, 145, 90, 0.40), transparent 65%)
      `,
      glow: "radial-gradient(circle, rgba(252, 200, 165, 0.55) 0%, rgba(232, 116, 60, 0.30) 40%, transparent 75%)",
    },
  };

  const renderPaletteLayers = (p: Palette, visible: boolean) => (
    <div
      className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Vertical wash */}
      <div className="absolute inset-0" style={{ background: p.wash }} />
      {/* Bottom-anchored mesh */}
      <div
        className="absolute inset-0 mesh-gradient"
        style={{ background: p.mesh }}
      />
      {/* Soft glow behind chat widget */}
      <div
        className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[42rem] h-[42rem] rounded-full glow-pulse"
        style={{ background: p.glow, filter: "blur(70px)" }}
      />
    </div>
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white"
    >
      {renderPaletteLayers(palettes.calm,  connected)}
      {renderPaletteLayers(palettes.alert, !connected)}

      {/* Layer 4: shimmer sweep — barely-there diagonal light drift */}
      <div
        className="absolute inset-0 shimmer-sweep"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.20) 50%, transparent 65%)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Layer 6: top vignette — anchors the eye and frames the headline */}
      <div
        className="absolute inset-x-0 top-0 h-48"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)",
        }}
      />

      {/* Layer 7: noise texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <style jsx>{`
        @keyframes mesh-rotate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50%      { transform: rotate(6deg) scale(1.08); }
        }
        @keyframes glow-pulse {
          0%, 100% { transform: translateY(-50%) scale(1);   opacity: 1;    }
          50%      { transform: translateY(-50%) scale(1.12); opacity: 0.85; }
        }
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-30%); opacity: 0;   }
          50%  {                              opacity: 0.6; }
          100% { transform: translateX(30%);  opacity: 0;   }
        }
        .mesh-gradient   { animation: mesh-rotate    44s ease-in-out infinite; transform-origin: center; }
        .glow-pulse      { animation: glow-pulse     20s ease-in-out infinite; }
        .shimmer-sweep   { animation: shimmer-sweep  12s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .mesh-gradient, .glow-pulse, .shimmer-sweep { animation: none; }
        }
      `}</style>
    </div>
  );
}
