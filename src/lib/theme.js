// ─── EurekaAI Design Tokens ────────────────────────────────────────────────
// Four distinct emotional contexts: Landing, Dashboard, Focus, Test/Feynman

// ─── LANDING PAGE — White + Cool Teal ─────────────────────────────────────
export const L_BG      = "#FAFAFA";   // crisp off-white
export const L_SURFACE = "#FFFFFF";   // card surfaces
export const L_BORDER  = "#E5E5E5";   // subtle separation
export const L_TEXT    = "#0F0F0F";   // near-black
export const L_MUTED   = "#71717A";   // cool gray
export const L_ACCENT  = "#14B8A6";   // bold teal
export const L_ACCENT2 = "#2DD4BF";   // lighter teal for hover states
export const L_GLOW    = "#14B8A61A"; // teal ambient tint

// ─── DASHBOARD — Neutral Dark Slate + Glass + Teal Accent ──────────────────
export const D_BG      = "#0A0A0A";   // near-black neutral slate
export const D_SURFACE = "rgba(255,255,255,0.05)";  // frosted glass card
export const D_BORDER  = "rgba(255,255,255,0.08)";  // glass edge
export const D_TEXT    = "#FAFAFA";   // cool near-white
export const D_MUTED   = "#A1A1AA";   // neutral grey muted
export const D_ACCENT  = "#14B8A6";   // teal pops precisely against dark
export const D_ACCENT2 = "#2DD4BF";   // lighter teal for badges
export const D_CARD2   = "rgba(255,255,255,0.03)";  // inner glass
export const D_GLOW    = "#14B8A618";

// ─── FOCUS MODE — Dark Forest Immersion ──────────────────────────────────────
export const F_BG      = "#0C1510";   // deep forest night
export const F_SURFACE = "#132019";   // dark card
export const F_BORDER  = "#1E3828";   // dark green border, barely visible
export const F_TEXT    = "#C4D9B9";   // moonlit leaf — not harsh white
export const F_MUTED   = "#5A7A65";   // forest floor muted
export const F_ACCENT  = "#4CAF72";   // fresh living green
export const F_ACCENT2 = "#6FCF97";   // lighter glow green
export const F_GLOW    = "#2D6B4025"; // deep canopy ambient

// ─── FEYNMAN / TEST MODE — Dark Charcoal + Glass ───────────────────────
export const T_BG      = "#09090B";   // dark zinc
export const T_SURFACE = "rgba(255,255,255,0.05)";  // frosted glass
export const T_BORDER  = "rgba(255,255,255,0.08)";  // glass edge
export const T_TEXT    = "#FAFAFA";   // cool near-white
export const T_MUTED   = "#A1A1AA";   // zinc muted
export const T_ACCENT  = "#818CF8";   // indigo — sharp, exam-focused pop
export const T_ACCENT2 = "#A5B4FC";   // lighter indigo for badges

// ─── LEGACY COMPAT (keeps old api routes and non-redesigned pages working) ───
export const TEAL      = "#14B8A6";   // original teal
export const TEAL_DIM  = "#2DD4BF";
export const BG        = "#0A0A0A";   // unified dark slate
export const CARD      = "rgba(255,255,255,0.05)";  // glass card
export const CARD2     = "rgba(255,255,255,0.03)";  // inner glass
export const BORDER    = "rgba(255,255,255,0.08)";  // glass edge
export const TEXT      = "#FAFAFA";   // cool near-white
export const MUTED     = "#A1A1AA";   // neutral grey

// ─── SUBJECT COLORS — cohesive, not rainbow ──────────────────────────────────
export const SUBJECT_COLORS = {
  Physics:   "#14B8A6",   // teal — brand primary
  Chemistry: "#818CF8",   // indigo
  Maths:     "#F472B6",   // pink
  Biology:   "#34D399",   // emerald
  Other:     "#A1A1AA",   // neutral slate
};

export const DIFF_COLORS = {
  Easy:   "#34D399",   // green
  Medium: "#FBBF24",   // amber
  Hard:   "#F87171",   // red
};
