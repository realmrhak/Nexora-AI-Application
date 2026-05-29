import pdf from "pdf-parse";
import axios from "axios";

/**
 * Extract text from PDF URL (Cloudinary / remote)
 */
export const extractTextFromPDF = async (fileUrl) => {
  let dataBuffer;

  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    // FETCH PDF (SAFE FOR CLOUD + RENDER)
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 120000, // 2 min timeout
    });

    if (!response.data) {
      throw new Error("Failed to download PDF file");
    }

    dataBuffer = Buffer.from(response.data);

    // PARSE PDF (CORRECT WAY)
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