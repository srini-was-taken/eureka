"use client";
import {
  Brain, Sparkles, FlaskConical, Timer, Target, NotebookPen,
  Eye, Calendar, Upload, ImageIcon, Camera, Home, Star,
  Flame, Zap, BarChart2, Send, Lock, Maximize2, Highlighter,
  StickyNote, BookOpen, Menu, X, ArrowLeft, Check, ChevronRight,
  Clock, Crosshair
} from "lucide-react";

const MAP = {
  brain: Brain,
  sparkle: Sparkles,
  feynman: FlaskConical,
  clock: Timer,
  clockalt: Clock,
  target: Crosshair,
  mistake: NotebookPen,
  eye: Eye,
  cal: Calendar,
  upload: Upload,
  image: ImageIcon,
  camera: Camera,
  home: Home,
  star: Star,
  fire: Flame,
  streak: Flame,
  trophy: Star,
  zap: Zap,
  chart: BarChart2,
  send: Send,
  lock: Lock,
  expand: Maximize2,
  highlight: Highlighter,
  note: StickyNote,
  book: BookOpen,
  menu: Menu,
  close: X,
  back: ArrowLeft,
  check: Check,
  arrow: ChevronRight,
};

export default function Icon({ name, size = 18, color = "currentColor", strokeWidth = 1.75 }) {
  const LucideIcon = MAP[name];
  if (!LucideIcon) return <span style={{ fontSize: size, lineHeight: 1 }}>•</span>;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} style={{ display: "block", flexShrink: 0 }} />;
}
