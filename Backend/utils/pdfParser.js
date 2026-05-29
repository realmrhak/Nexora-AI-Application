import axios from "axios";
import pdf from "pdf-parse";

/**
 * Extract text from PDF URL (Cloudinary / remote)
 */
export const extractTextFromPDF = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    console.log("📥 Downloading PDF:", fileUrl);

    // ✅ safer fetch (works better on Render than axios sometimes)
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF file. Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🚨 safety check
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty PDF buffer received");
    }

    // 📄 parse PDF
    const data = await pdf(buffer);

    const text = (data.text || "").replace(/\s+/g, " ").trim();

    if (!text) {
      throw new Error("No extractable text (maybe scanned PDF image)");
    }

    console.log("✅ PDF extracted successfully");

    return {
      text,
      numPages: data.numpages || 0,
      info: data.info || {},
    };

  } catch (error) {
    console.error("========== PDF PARSING ERROR ==========");
    console.error("URL:", fileUrl);
    console.error("ERROR:", error.message);

    throw new Error("Failed to extract text from PDF");
  }
};