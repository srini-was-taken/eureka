import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdf(buffer);

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
