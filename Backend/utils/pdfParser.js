import pkg from "pdf-parse";
import axios from "axios";

const pdf = pkg;

/**
 * Extract text from PDF URL (Cloudinary / remote)
 */
export const extractTextFromPDF = async (fileUrl) => {
  let dataBuffer;

  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    // Fetch PDF from Cloudinary / remote URL
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
    });

    if (!response.data) {
      throw new Error("Failed to download PDF file");
    }

    dataBuffer = Buffer.from(response.data);

    // Parse PDF
    const data = await pdf(dataBuffer);

    const text = (data.text || "").trim();

    if (!text) {
      throw new Error(
        "No extractable text found (PDF may be scanned image)"
      );
    }

    return {
      text,
      numPages: data.numpages || 0,
      info: data.info || {},
    };
  } catch (error) {
    console.error("========== PDF PARSING ERROR ==========");
    console.error("URL:", fileUrl);
    console.error(error.message);

    throw new Error(
      error?.message || "Failed to extract text from PDF"
    );
  }
};