"use client";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * Md — drop-in replacement for plain text wherever AI output is displayed.
 * Renders $inline$ and $$display$$ LaTeX via KaTeX, plus basic markdown.
 */
export default function Md({ children, style }) {
    if (!children) return null;
    return (
        <div className="md-content" style={style}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
