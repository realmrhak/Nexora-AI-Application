// ❌ import axios from "axios"; <-- HATA DO

import PDFParser from "pdf2json";

/**
 * Extract text from PDF URL using Native Fetch + pdf2json
 */
export const extractTextFromPDF = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    console.log("📥 Fetching PDF:", fileUrl);

    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF! Status: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 Parsing PDF...");

    const pdfParser = new PDFParser();

    const result = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err) => {
        reject(new Error(err.parserError || "PDF parsing failed"));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        // ✅ FIX: pdf2json ka text extraction - Pages se manually extract karo
        let text = "";
        
        if (pdfData.Pages && pdfData.Pages.length > 0) {
          for (const page of pdfData.Pages) {
            if (page.Texts && page.Texts.length > 0) {
              for (const textItem of page.Texts) {
                if (textItem.R && textItem.R.length > 0) {
                  for (const run of textItem.R) {
                    // pdf2json text ko decodeURIComponent karta hai
                    const decodedText = decodeURIComponent(run.T || "");
                    text += decodedText + " ";
                  }
                }
              }
            }
            text += "\n"; // Page break
          }
        }
        
        text = text.trim();
        
        resolve({
          text,
          numPages: pdfData.Pages?.length || 0,
          info: pdfData.Meta || {},
        });
      });

      pdfParser.parseBuffer(buffer);
    });

    if (!result.text) {
      throw new Error("No extractable text found in PDF");
    }

    console.log("✅ PDF parsed successfully");

    return {
      text: result.text,
      numPages: result.numPages,
      info: result.info,
      metadata: null,
      version: null,
    };

  } catch (error) {
    console.error("❌ PDF Extraction Error:", error.message);
    throw new Error(error.message || "Failed to extract text from PDF");
  }
};