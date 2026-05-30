import axios from "axios";

// Dynamic import for pdf-parse (CommonJS compatibility)
let pdfParse;

async function getPdfParser() {
  if (!pdfParse) {
    const module = await import("pdf-parse");
    pdfParse = module.default || module;
  }
  return pdfParse;
}

/**
 * Extract text from PDF URL
 */
export const extractTextFromPDF = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    console.log("📥 Fetching PDF:", fileUrl);

    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024,
    });

    const buffer = Buffer.from(response.data);

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