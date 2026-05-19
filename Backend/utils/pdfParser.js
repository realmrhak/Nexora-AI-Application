import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file (pdf-parse v2 uses class PDFParse, not a default function).
 * @param {string} filePath
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */
export const extractTextFromPDF = async (filePath) => {
    let parser;
    try {
        await fs.access(filePath);
        const dataBuffer = await fs.readFile(filePath);
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
        if (error && (error.code === "ENOENT" || error.code === "ENOTDIR")) {
            throw new Error(`PDF file not found or unreadable: ${filePath}`);
        }
        console.error("========== PDF PARSING ERROR ==========");
        console.error(error);
        throw new Error(
            error instanceof Error ? error.message : "Failed to extract text from PDF",
        );
    } finally {
        if (parser) {
            await parser.destroy().catch(() => {});
        }
    }
};
