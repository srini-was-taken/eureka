"use client";
import { TEAL } from "@/lib/theme";

const ICONS = {
  brain: "🧠", sparkle: "✦", atom: "⚛", book: "📖", chart: "📊", clock: "⏱",
  fire: "🔥", target: "🎯", upload: "⬆", pdf: "📄", send: "➤", star: "★",
  check: "✓", hint: "💡", feynman: "🔬", zap: "⚡", arrow: "→", chat: "💬",
  image: "🖼", mic: "🎤", eye: "👁", streak: "🔥", trophy: "🏆", cal: "📅",
  mistake: "📝", pomodoro: "🍅", user: "👤", home: "⌂", menu: "☰", close: "✕",
  back: "←", expand: "⤢", highlight: "🖊", note: "🗒", lock: "🔒",
};

export default function Icon({ name, size = 18, color = TEAL }) {
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        filter: color === TEAL ? "none" : "grayscale(0)",
      }}
    >
      {ICONS[name] || "•"}
    </span>
  );
}
