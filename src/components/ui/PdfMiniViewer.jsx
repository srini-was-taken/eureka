import { useState, useEffect } from "react";
import { T_MUTED as MUTED, T_ACCENT as TEAL, T_SURFACE as CARD2, T_BORDER as BORDER } from "@/lib/theme";

export default function PdfMiniViewer({ file, highlightPageRange, onExtracted, style }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const ab = await file.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({ data: ab }).promise;
      if (cancelled) return;
      
      const rendered = [];
      const pageTexts = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        // Render to canvas
        const vp = page.getViewport({ scale: 1.1 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        // Extract text from this page
        const tc = await page.getTextContent();
        const pageText = tc.items.map(item => item.str).join(" ");
        pageTexts.push({ pageNum: i, text: pageText });
        rendered.push({ canvas, pageNum: i });
        if (cancelled) return;
      }
      setPages(rendered);
      setLoading(false);
      // Notify parent with per-page text array + total pages
      if (onExtracted) onExtracted(pageTexts, doc.numPages);
    }
    load();
    return () => { cancelled = true; };
  }, [file, onExtracted]);

  if (loading) return (
    <div style={{ textAlign: "center", color: MUTED, padding: 32, fontSize: 14, ...style }}>
      Rendering PDF...
    </div>
  );

  const { start, end } = highlightPageRange || {};

  return (
    <div style={{ overflowY: "auto", maxHeight: 460, borderRadius: 12, border: `1px solid ${BORDER}`, background: CARD2, ...style }}>
      {pages.map(({ canvas, pageNum }) => {
        const inRange = start && end ? (pageNum >= start && pageNum <= end) : true;
        return (
          <div key={pageNum} style={{
            position: "relative",
            borderBottom: `1px solid ${BORDER}`,
            opacity: inRange ? 1 : 0.35,
            transition: "opacity .2s",
          }}>
            <img
              src={canvas.toDataURL()}
              alt={`Page ${pageNum}`}
              style={{ width: "100%", display: "block" }}
            />
            <div style={{
              position: "absolute", top: 6, right: 8,
              background: inRange ? TEAL + "cc" : "#ffffff30",
              color: inRange ? "#000" : "#fff",
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
            }}>
              {pageNum}
              {inRange && start && <span style={{ marginLeft: 4 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
