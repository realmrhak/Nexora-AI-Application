import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF URL
 * @param {string} fileUrl
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */

export const extractTextFromPDF = async (fileUrl) => {

    let parser;

    try {

        // Fetch PDF from Cloudinary URL
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch PDF file");
        }

        // Convert response to ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // Convert to Buffer
        const dataBuffer = Buffer.from(arrayBuffer);

        // Parse PDF
        parser = new PDFParse({ data: dataBuffer });

        const textResult = await parser.getText();

        const text = (textResult.text ?? "").trim();

        const numPages = textResult.total ?? 0;

        return {
            text,
            numPages,
            info: {},
        };

    } catch (error) {

        console.error("========== PDF PARSING ERROR ==========");
        console.error(error);

        throw new Error(
            error instanceof Error
                ? error.message
                : "Failed to extract text from PDF"
        );

    } finally {

        if (parser) {
            await parser.destroy().catch(() => {});
        }
    }
};