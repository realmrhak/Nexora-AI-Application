import OpenAI from "openai";

// DEFAULT MODEL
const DEFAULT_MODEL =
  "mistralai/mistral-7b-instruct:free";

let client = null;

// OPENROUTER CLIENT
const getClient = () => {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("OPENROUTER_API_KEY missing");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: key,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }

  return client;
};

// MODEL PICKER
const getModelId = () =>
  (
    process.env.OPENROUTER_MODEL ||
    DEFAULT_MODEL
  ).trim();

// SAFE JSON PARSER
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

// RETRY + FALLBACK
const generateContentWithRetry = async (
  prompt,
  config = {}
) => {
  const MODELS = [
    getModelId(),
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-2-9b-it:free",
    "openrouter/auto",
  ];

  for (let model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);

      const res =
        await getClient().chat.completions.create({
          model,

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature:
            config.temperature ?? 0.7,

          max_tokens:
            config.maxTokens ?? 2500,
        });

      const output =
        res?.choices?.[0]?.message?.content;

      if (output) {
        console.log(`SUCCESS MODEL: ${model}`);
        return output;
      }
    } catch (err) {

      console.log("============== OPENROUTER ERROR ==============");

      console.log("MODEL:", model);

      console.log("STATUS:", err?.status);

      console.log("MESSAGE:", err?.message);

      console.log(
        "FULL ERROR:",
        JSON.stringify(err, null, 2)
      );

      console.log("==============================================");

      // small delay before next model
      await new Promise((r) =>
        setTimeout(r, 2000)
      );

      continue;
    }
  }

  throw new Error(
    "AI service is temporarily unavailable."
  );
};

// CHAT WITH CONTEXT
export const chatWithContext = async (
  question,
  chunks = []
) => {
  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.content}`)
    .join("\n");

  const prompt = `
Answer ONLY using the provided context.

Context:
${context}

Question:
${question}

Answer clearly and accurately.
`;

  const output =
    await generateContentWithRetry(prompt);

  return output || "No answer generated.";
};

// SUMMARY
export const generateSummary =
  async (text) => {
    return await generateContentWithRetry(
      `
Summarize the following content clearly and concisely:

${text.substring(0, 15000)}
`
    );
  };

// EXPLAIN CONCEPT
export const explainConcept =
  async (concept, context) => {
    return await generateContentWithRetry(
      `
Explain the concept "${concept}" in simple words with examples.

Context:
${context}
`
    );
  };

// FLASHCARDS
export const generateFlashcards =
  async (text, count = 10) => {

    const words = text.split(" ");

    const randomStart = Math.floor(
      Math.random() *
        Math.max(1, words.length - 12000)
    );

    const randomText = words
      .slice(randomStart, randomStart + 12000)
      .join(" ");

    const prompt = `
Create EXACTLY ${count} UNIQUE flashcards.

Rules:
- Return ONLY a valid JSON array
- No repeated questions
- Keep answers concise
- Questions should cover different concepts

Format:
[
  {
    "question": "...",
    "answer": "..."
  }
]

Text:
${randomText}
`;

    const output =
      await generateContentWithRetry(prompt, {
        temperature: 0.9,
        maxTokens: 2000,
      });

    console.log("RAW FLASHCARD RESPONSE:");
    console.log(output);

    const parsed = safeJSONParse(output);

    return parsed
      .slice(0, count)
      .map((card) => ({
        question: card.question || "",
        answer: card.answer || "",
      }));
  };

// QUIZ GENERATOR
export const generateQuiz = async (
  text,
  numQuestions = 5
) => {

  const words = text.split(" ");

  const randomStart = Math.floor(
    Math.random() *
      Math.max(1, words.length - 12000)
  );

  const randomText = words
    .slice(randomStart, randomStart + 12000)
    .join(" ");

  const prompt = `
Create EXACTLY ${numQuestions} UNIQUE multiple choice questions.

Rules:
- Return ONLY a valid JSON array
- Questions must NOT repeat
- Include conceptual and factual questions

Each question MUST contain:

{
  "question": "...",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctAnswer": "FULL OPTION TEXT",
  "explanation": "Short explanation"
}

IMPORTANT:
- correctAnswer MUST be FULL option text
- NEVER use A/B/C/D

Text:
${randomText}
`;

  const output =
    await generateContentWithRetry(prompt, {
      temperature: 0.8,
      maxTokens: 3000,
    });

  console.log("RAW QUIZ RESPONSE:");
  console.log(output);

  const parsed = safeJSONParse(output);

  return parsed
    .slice(0, numQuestions)
    .map((q) => ({
      question: q.question || "",

      options:
        Array.isArray(q.options) &&
        q.options.length === 4
          ? q.options
          : [],

      correctAnswer:
        q.correctAnswer || "",

      explanation:
        q.explanation ||
        `Correct answer: ${q.correctAnswer}`,
    }));
};
