// Axios ko hataya diya hai, native fetch use karenge

export const extractTextFromPDF = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    console.log("📥 Fetching PDF:", fileUrl);

    // Native Fetch (No Axios, No Auth headers)
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF! Status: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 Parsing PDF...");

    // ✅ FIX: Robust Dynamic Import for pdf-parse
    const pdfModule = await import("pdf-parse");
    // CommonJS module default export ko safely extract karna
    const pdfParse = typeof pdfModule === 'function' ? pdfModule : pdfModule.default;

    // Agar phir bhi function nahi mila (rare edge case)
    if (typeof pdfParse !== 'function') {
        console.error("Imported module structure:", pdfModule);
        throw new Error("pdf-parse library did not load as a function");
    }

    const data = await pdfParse(buffer);

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