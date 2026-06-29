/**
 * examConfig.js
 * Single source of truth for all exam-specific configurations.
 * Each exam defines its subjects, AI model, and solver system prompt suffix.
 */

export const EXAM_CONFIG = {
    jee_adv: {
        label: "JEE Advanced",
        subjects: ["Physics", "Chemistry", "Maths"],
        // Use a reasoning model for hard problems
        model: "llama-3.3-70b-versatile",
        useReasoning: true,
        systemPromptSuffix: `
This is a JEE Advanced student. Problems are highly conceptual and multi-step.
Use a strict Socratic approach with the full 4-stage hint ladder.
Apply JEE-specific tricks: options analysis, dimensional analysis, limiting cases, symmetry.`,
    },
    jee_mains: {
        label: "JEE Mains",
        subjects: ["Physics", "Chemistry", "Maths"],
        model: "llama-3.3-70b-versatile",
        useReasoning: false,
        systemPromptSuffix: `
This is a JEE Mains student. Problems are formula-based and moderately difficult.
Keep hints concise. Focus on direct application of formulae and concepts.
Avoid deep multi-step reasoning chains.`,
    },
    bitsat: {
        label: "BITSAT",
        subjects: ["Physics", "Chemistry", "Maths", "Aptitude", "English"],
        model: "llama-3.3-70b-versatile",
        useReasoning: true,
        systemPromptSuffix: `
This is a BITSAT student. Subjects include Physics, Chemistry, Maths, Aptitude, and English.
Problems are fast-paced and tricky. For Aptitude/English, guide with one targeted question about the reasoning pattern. For science subjects, apply the standard Socratic 4-stage ladder — ONE hint per reply, no full solutions.`,
    },
    neet: {
        label: "NEET",
        subjects: ["Physics", "Chemistry", "Biology"],
        model: "llama-3.3-70b-versatile",
        useReasoning: false,
        systemPromptSuffix: `
This is a NEET student. Subjects are Physics, Chemistry, and Biology.
Problems are NCERT-based and concept-heavy but not deeply mathematical.
For Biology, focus on definitions, mechanisms, and diagrams.
Keep hints short and grounded in NCERT language.`,
    },
};

export const DEFAULT_EXAM_KEY = "jee_adv";

/** Returns the EXAM_CONFIG entry for a given key, falling back to default. */
export function getExamConfig(examKey) {
    return EXAM_CONFIG[examKey] ?? EXAM_CONFIG[DEFAULT_EXAM_KEY];
}
