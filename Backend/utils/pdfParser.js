// ❌ import axios from "axios"; <-- IS LINE KO HATA DENA YA COMMENT KAR DENA

let pdfParse;

async function getPdfParser() {
  if (!pdfParse) {
    const module = await import("pdf-parse");
    pdfParse = module.default || module;
  }
  return pdfParse;
}

/**
 * Extract text from PDF URL using Native Fetch (No Axios, No Auth headers)
 */
export const extractTextFromPDF = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    console.log("📥 Fetching PDF (Using Native Fetch):", fileUrl);

    // Node.js ka built-in fetch use karein (Koi auth header nahi bhega)
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF! Status: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 Parsing PDF...");

    const pdfParser = await getPdfParser();
    const data = await pdfParser(buffer);

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