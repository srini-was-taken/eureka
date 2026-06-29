// ─── EurekaAI Design Tokens ────────────────────────────────────────────────
// Four distinct emotional contexts: Landing, Dashboard, Focus, Test/Feynman

// ─── LANDING PAGE — White + Warm Orange ─────────────────────────────────────
export const L_BG      = "#FAFAF8";   // warm off-white — feels like paper, not a screen
export const L_SURFACE = "#FFFFFF";   // card surfaces
export const L_BORDER  = "#EAE5DC";   // warm, subtle separation
export const L_TEXT    = "#1A1714";   // near-black, warm tinted
export const L_MUTED   = "#7A736B";   // warm gray
export const L_ACCENT  = "#E8610A";   // bold warm orange — energy, momentum, confidence
export const L_ACCENT2 = "#F4874A";   // lighter orange for hover states
export const L_GLOW    = "#E8610A1A"; // orange ambient tint

// ─── DASHBOARD — Neutral Dark Slate + Glass + Green Accent ──────────────────
// Deep neutral dark — green only as accent pop, not the base.
export const D_BG      = "#0D0F12";   // near-black neutral slate
export const D_SURFACE = "rgba(255,255,255,0.05)";  // frosted glass card
export const D_BORDER  = "rgba(255,255,255,0.09)";  // glass edge
export const D_TEXT    = "#ECEEF0";   // cool near-white
export const D_MUTED   = "#7A8490";   // neutral grey muted
export const D_ACCENT  = "#4ADE80";   // green pops precisely against dark
export const D_ACCENT2 = "#86EFAC";   // lighter green for badges
export const D_CARD2   = "rgba(255,255,255,0.03)";  // inner glass
export const D_GLOW    = "#4ADE8018";

// ─── FOCUS MODE — Dark Forest Immersion ──────────────────────────────────────
export const F_BG      = "#0C1510";   // deep forest night
export const F_SURFACE = "#132019";   // dark card
export const F_BORDER  = "#1E3828";   // dark green border, barely visible
export const F_TEXT    = "#C4D9B9";   // moonlit leaf — not harsh white
export const F_MUTED   = "#5A7A65";   // forest floor muted
export const F_ACCENT  = "#4CAF72";   // fresh living green
export const F_ACCENT2 = "#6FCF97";   // lighter glow green
export const F_GLOW    = "#2D6B4025"; // deep canopy ambient

// ─── FEYNMAN / TEST MODE — Dark Warm Charcoal + Glass ───────────────────────
export const T_BG      = "#111016";   // dark warm-neutral — serious, not cold
export const T_SURFACE = "rgba(255,255,255,0.07)";  // frosted glass
export const T_BORDER  = "rgba(255,255,255,0.11)";  // glass edge
export const T_TEXT    = "#F0EDE8";   // warm near-white
export const T_MUTED   = "#8A857D";   // de-saturated warm grey
export const T_ACCENT  = "#E8C98A";   // warm amber — sharp, exam-focused pop
export const T_ACCENT2 = "#F5DFA0";   // lighter amber for badges

// ─── LEGACY COMPAT (keeps old api routes and non-redesigned pages working) ───
export const TEAL      = "#E8610A";   // brand orange
export const TEAL_DIM  = "#F4874A";
export const BG        = "#0D0F12";   // unified dark slate (matches dashboard)
export const CARD      = "rgba(255,255,255,0.06)";  // glass card
export const CARD2     = "rgba(255,255,255,0.04)";  // inner glass
export const BORDER    = "rgba(255,255,255,0.09)";  // glass edge
export const TEXT      = "#ECEEF0";   // cool near-white
export const MUTED     = "#7A8490";   // neutral grey

// ─── SUBJECT COLORS — cohesive, not rainbow ──────────────────────────────────
export const SUBJECT_COLORS = {
  Physics:   "#E8610A",   // orange — brand primary
  Chemistry: "#64B5F6",   // steel blue — calm, scientific
  Maths:     "#4ADE80",   // green — precise, logical
  Biology:   "#E8C98A",   // warm amber — organic
  Other:     "#A0AEC0",   // neutral slate
};

export const DIFF_COLORS = {
  Easy:   "#4ADE80",   // green
  Medium: "#E8C98A",   // amber
  Hard:   "#F87171",   // red
};
