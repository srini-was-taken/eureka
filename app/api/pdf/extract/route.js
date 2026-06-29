import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const pageStart = parseInt(formData.get("pageStart") || "1");
    const pageEnd = formData.get("pageEnd") ? parseInt(formData.get("pageEnd")) : null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If page range requested, render only those pages
    const options = {};
    if (pageEnd) {
      // pdf-parse pagerender option: return text only for selected pages
      options.pagerender = function (pageData) {
        const pageNum = pageData.pageIndex + 1; // 1-indexed
        if (pageNum < pageStart || pageNum > pageEnd) return Promise.resolve("");
        return pageData.getTextContent().then((tc) =>
          tc.items.map((i) => i.str).join(" ")
        );
      };
    }

    const data = await pdf(buffer, options);

    return Response.json({
      text: data.text,
      pages: data.numpages,
      filename: file.name,
    });
  } catch (err) {
    console.error("PDF extract error:", err);
    return Response.json({ error: "Failed to extract PDF text" }, { status: 500 });
  }
}
