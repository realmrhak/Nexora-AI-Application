import OpenAI from "openai";

const DEFAULT_MODEL = "deepseek/deepseek-v4-flash:free";

let client = null;

const getClient = () => {
    const key = process.env.OPENROUTER_API_KEY;

    if (!key?.trim()) {
        throw new Error("OPENROUTER_API_KEY missing in .env");
    }

    if (!client) {
        client = new OpenAI({
            apiKey: key,
            baseURL: "https://openrouter.ai/api/v1",
        });
    }

    return client;
};

const getModelId = () =>
    (process.env.OPENROUTER_MODEL || DEFAULT_MODEL).trim();

/**
 * ✅ SAFE JSON PARSER (IMPORTANT FIX)
 */
const safeJSONParse = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                return [];
            }
        }
        return [];
    }
};

/**
 * Retry + call
 */
const generateContentWithRetry = async (prompt, config = {}) => {
    let lastError;

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await getClient().chat.completions.create({
                model: getModelId(),
                messages: [{ role: "user", content: prompt }],
                temperature: config.temperature ?? 0.4,
                max_tokens: config.maxTokens ?? 4096,
            });

            return res.choices?.[0]?.message?.content || "";

        } catch (err) {
            lastError = err;

            if ((err.status === 429 || err.status === 503) && attempt === 0) {
                await new Promise(r => setTimeout(r, 1500));
                continue;
            }

            throw err;
        }
    }

    throw lastError;
};

/**
 * FLASHCARDS (FIXED)
 */
export const generateFlashcards = async (text, count = 10) => {
    const safeText = text.substring(0, 15000);
    const n = Math.min(Math.max(count, 1), 50);

    const prompt = `Create exactly ${n} flashcards.

STRICT RULES:
- Return ONLY JSON array
- No markdown
- No explanation
- Each object:
{"question":"","answer":"","difficulty":"easy|medium|hard"}

Text:
${safeText}`;

    const output = await generateContentWithRetry(prompt);

    const data = safeJSONParse(output);

    if (!Array.isArray(data)) return [];

    return data;
};

/**
 * QUIZ (SUPER ROBUST FIX)
 */
export const generateQuiz = async (text, numQuestions = 5) => {
    const safeText = text.substring(0, 15000);
    const n = Math.min(Math.max(numQuestions, 1), 20);

    const prompt = `Generate exactly ${n} MCQs.

STRICT FORMAT:

Q: ...
01: ...
02: ...
03: ...
04: ...
C: ...
E: ...
D: easy|medium|hard

NO EXTRA TEXT
Separate with ---`;

    const output = await generateContentWithRetry(prompt);

    const questions = [];
    const blocks = output.split("---").filter(Boolean);

    for (const block of blocks) {
        const lines = block.split("\n");

        let q = "", opts = [], correct = "", exp = "", diff = "medium";

        for (let line of lines) {
            line = line.trim();

            if (line.startsWith("Q:")) q = line.slice(2).trim();
            else if (/^0[1-4]:/.test(line)) opts.push(line.slice(3).trim());
            else if (line.startsWith("C:")) correct = line.slice(2).trim();
            else if (line.startsWith("E:")) exp = line.slice(2).trim();
            else if (line.startsWith("D:")) diff = line.slice(2).trim();
        }

        // ✅ HARD VALIDATION
        if (q && opts.length === 4 && correct) {
            questions.push({
                question: q,
                options: opts,
                correctAnswer: correct,
                explanation: exp || "",
                difficulty: diff || "medium",
            });
        }
    }

    return questions.slice(0, n);
};

/**
 * SUMMARY
 */
export const generateSummary = async (text) => {
    const prompt = `Summarize clearly:

${text.substring(0, 20000)}`;

    return await generateContentWithRetry(prompt, { temperature: 0.5 });
};

/**
 * CHAT
 */
export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[${i + 1}] ${c.content}`).join("\n");

    const prompt = `Context:
${context}

Question:
${question}`;

    return await generateContentWithRetry(prompt);
};

/**
 * EXPLAIN
 */
export const explainConcept = async (concept, context) => {
    const prompt = `Explain "${concept}" simply with examples:

${context}`;

    return await generateContentWithRetry(prompt);
};