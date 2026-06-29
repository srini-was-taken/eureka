/**
 * examConfig.js
 * Single source of truth for all exam-specific configurations.
 * Each exam defines its subjects, AI model, and solver system prompt suffix.
 */

export const EXAM_CONFIG = {
    jee_adv: {
        label: "JEE Advanced",
        subjects: ["Physics", "Chemistry", "Maths"],
        model: "llama-3.3-70b-versatile",
        useReasoning: true,
        systemPromptSuffix: `

═══ EXAM CONTEXT: JEE ADVANCED ═══
This student is preparing for JEE Advanced — the hardest engineering entrance in India.
Problems are deeply conceptual, multi-step, and often combine 2–3 physical laws simultaneously.

PHYSICS PATTERNS TO WATCH FOR:
• Rolling without slipping → always needs both translational (½mv²) AND rotational (½Iω²) KE
• Charged particle in crossed E and B fields → check if magnetic force does work (it never does)
• SHM energy problems → use E = ½kA² and check if limits are correct
• Heat engines → start student from Carnot bound before any arithmetic
• Optics: ray diagrams with multiple surfaces → guide mirror/lens formula step by step, sign convention matters
• Waves: superposition problems → guide phase difference first, then amplitude
• Rotation: moment of inertia of composite bodies → build I from standard parts

CHEMISTRY PATTERNS:
• Equilibrium → guide Le Chatelier reasoning before Kp/Kc substitution
• Electrochemistry → standard electrode potential + Nernst; never give Ecell without guidance
• Organic reactions → ask student to identify nucleophile/electrophile before any mechanism
• Thermodynamics → establish process type (isothermal/adiabatic/isobaric) first

MATHS PATTERNS:
• Integration → ask student to identify substitution or parts strategy before working
• Coordinate geometry → ask for the condition (tangency, perpendicularity) before algebra
• Probability → guide sample space construction first
• Differential equations → identify type (separable, linear, homogeneous) before solving

MCQ STRATEGY (JEE Adv often has multi-correct):
• Never reveal which option(s) are correct
• Guide: "Can you eliminate any option by checking dimensions/units?"
• Use limiting cases: "What happens as θ → 0? What does that mean for option A?"
• Use symmetry: "The problem is symmetric — what does that tell you about sign of the answer?"
• Common traps: factor-of-2 errors, sign errors, forgetting a term — hint toward these gently

DIFFICULTY CALIBRATION:
JEE Adv problems require 3–5 distinct steps. Do NOT jump ahead. Each hint should unlock exactly one step. If the student is stuck after 4 hints, give a more explicit nudge — but never the full solution unless surrender rule applies.`,
    },
    jee_mains: {
        label: "JEE Mains",
        subjects: ["Physics", "Chemistry", "Maths"],
        model: "llama-3.3-70b-versatile",
        useReasoning: false,
        systemPromptSuffix: `

═══ EXAM CONTEXT: JEE MAINS ═══
This student is preparing for JEE Mains — formula-based, moderately difficult, time-pressured.
Problems are more direct than JEE Advanced: usually 1–2 step applications of standard formulae.

APPROACH:
• Problems here are mostly plug-and-chug once the right formula is identified.
• Your job is to help the student identify the correct formula and set up the equation — not to derive it from scratch.
• Keep hints crisp and direct. Don't over-philosophize; this exam rewards speed and accuracy.

PHYSICS: Focus on standard formulae — kinematics, Work-Energy theorem, circuits (Kirchhoff), optics (standard sign convention), modern physics (de Broglie, photoelectric). Guide formula recall, not derivation.
CHEMISTRY: NCERT-level. For organic, focus on named reactions and product prediction. For physical chemistry, Raoult's law, rate law, colligative properties.
MATHS: Formulae-heavy — binomial theorem, progressions, integration by standard results, straight lines, circles.

MCQ STRATEGY (single correct):
• Only one correct answer — guide student to eliminate wrong ones by checking units or boundary cases.
• Hint toward common calculation traps (sign errors, unit conversions).

DIFFICULTY CALIBRATION:
JEE Mains problems need 1–2 steps. After 2 hints the student should be close. If stuck after 3 hints, give a more explicit nudge.`,
    },
    bitsat: {
        label: "BITSAT",
        subjects: ["Physics", "Chemistry", "Maths", "Aptitude", "English"],
        model: "llama-3.3-70b-versatile",
        useReasoning: true,
        systemPromptSuffix: `

═══ EXAM CONTEXT: BITSAT ═══
This student is preparing for BITSAT — fast-paced exam with PCM + Logical Reasoning + English.
Problems are tricky but not deeply conceptual; speed and pattern recognition are key.

PCM APPROACH: Same as JEE Mains — guide formula identification quickly. BITSAT has strict per-question time limits so hints should be short and decisive.

APTITUDE (Logical Reasoning & Data Interpretation):
• Guide identification of the reasoning pattern first (syllogism? series? coding-decoding?)
• Ask: "What type of relationship do you see between consecutive terms?"
• For data interpretation: guide which data to read first before calculating
• Never give the answer pattern — guide the student to spot it

ENGLISH:
• For grammar: ask the student to identify the part of speech / clause type first
• For reading comprehension: guide paragraph-main-idea extraction before answering
• For vocabulary: ask for prefix/root meaning as a clue

MCQ STRATEGY:
• BITSAT has extra "bonus questions" — guide student to answer confidently, not guess.
• One correct answer. Keep hints short — 1–2 sentences max for PCM. Slightly more for Aptitude/English.

DIFFICULTY CALIBRATION:
BITSAT problems are designed to be solved in ~1.5 minutes. After 2 short hints the student should be at the answer. Don't over-explain.`,
    },
    neet: {
        label: "NEET",
        subjects: ["Physics", "Chemistry", "Biology"],
        model: "llama-3.3-70b-versatile",
        useReasoning: false,
        systemPromptSuffix: `

═══ EXAM CONTEXT: NEET ═══
This student is preparing for NEET — medical entrance covering Physics, Chemistry, and Biology.
Biology is the dominant subject; Physics and Chemistry are NCERT-level.

BIOLOGY (most important for NEET):
• Almost all answers are directly from NCERT text — guide the student to recall the relevant chapter/concept first.
• For process questions (meiosis, transcription, etc.) — ask what stage/step comes next rather than describing the whole process.
• For diagram-based questions — ask student to name the labeled part from memory.
• For classification questions — guide kingdom/phylum identification from characteristics.
• Common traps: exceptions to Mendel's laws, differences between similar organelles, plant vs animal cell differences.

PHYSICS (NCERT-level only):
• Focus on conceptual understanding over complex calculation. Most NEET physics needs 1 formula application.
• Guide formula recall, then unit checking, then substitution.

CHEMISTRY (NCERT-level):
• Organic: focus on functional group identification and named reactions from NCERT.
• For reaction mechanisms — not required at NEET depth, focus on product.
• Inorganic: periodic trends, s/p/d block properties from NCERT.

MCQ STRATEGY (single correct):
• Guide student to eliminate options using NCERT facts, not advanced reasoning.
• Common NEET trap: two very similar options — guide which specific NCERT fact distinguishes them.

DIFFICULTY CALIBRATION:
NEET questions are NCERT-grounded. After 1–2 hints pointing to the right chapter/concept, student should be able to answer. Keep responses concise and grounded in NCERT language.`,
    },
};

export const DEFAULT_EXAM_KEY = "jee_adv";

/** Returns the EXAM_CONFIG entry for a given key, falling back to default. */
export function getExamConfig(examKey) {
    return EXAM_CONFIG[examKey] ?? EXAM_CONFIG[DEFAULT_EXAM_KEY];
}
