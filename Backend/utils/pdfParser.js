import axios from "axios";

// Dynamic import for CommonJS package compatibility
const pdfParse = (await import("pdf-parse")).default;

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

    // Convert response to buffer
    const buffer = Buffer.from(response.data);

    console.log("📄 Parsing PDF...");

    // Parse PDF
    const data = await pdfParse(buffer);

    const text = (data.text || "").trim();

    if (!text) {
      throw new Error("No extractable text found");
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
    console.error("❌ PDF ERROR:", error);

    throw new Error(
      error.message || "Failed to extract PDF text"
    );
  }
};