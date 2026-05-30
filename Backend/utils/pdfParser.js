// ❌ import axios from "axios"; <-- IS LINE KO HATA DENA YA COMMENT KAR DENA

/**
 * Extract text from PDF URL using Native Fetch (No Axios, No Auth headers)
 */
export const extractTextFromPDF = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    console.log("📥 Fetching PDF (Using Native Fetch):", fileUrl);

    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF! Status: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 Parsing PDF...");

    // ✅ FIX: Direct import with proper default export handling
const pdfParseModule = await import("pdf-parse");
console.log("Module structure:", Object.keys(pdfParseModule));
console.log("Module.default:", pdfParseModule.default);
console.log("Module.default type:", typeof pdfParseModule.default);
    
    // pdf-parse exports as default, so check both possibilities
    const pdfParse = pdfParseModule.default?.default || pdfParseModule.default || pdfParseModule;

    const data = await pdfParse(buffer);

    const text = (data.text || "").trim();

    if (!text) {
      throw new Error("No extractable text found in PDF");
    }

    console.log("✅ PDF parsed successfully");

    return {
      text,
      numPages: data.numpages || 0,
      info: data.info || {},
      metadata: data.metadata || null,
      version: data.version || null,
    };

  } catch (error) {
    console.error("❌ PDF Extraction Error:", error.message);
    throw new Error(error.message || "Failed to extract text from PDF");
  }
};