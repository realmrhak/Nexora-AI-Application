import axios from "axios";
import pdfParse from "pdf-parse";

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
    });

    const buffer = Buffer.from(response.data);

    const data = await pdfParse(buffer);

    const text = (data.text || "").trim();

    if (!text) {
      throw new Error("No extractable text found");
    }

    return {
      text,
      numPages: data.numpages || 0,
      info: data.info || {},
    };

  } catch (error) {
    console.error("PDF ERROR:", error.message);
    throw new Error("Failed to extract PDF text");
  }
};