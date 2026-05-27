import OpenAI from "openai";

// ✅ DEFAULT MODEL
const DEFAULT_MODEL =
  "meta-llama/llama-3-8b-instruct:free";

let client = null;

// CLIENT
const getClient = () => {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY missing"
    );
  }

  if (!client) {
    client = new OpenAI({
      apiKey: key,
      baseURL:
        "https://openrouter.ai/api/v1",
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
    const match =
      text.match(/\[[\s\S]*\]/);

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
    "openrouter/auto",
  ];

  for (let model of MODELS) {
    try {
      const res =
        await getClient().chat.completions.create(
          {
            model,

            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],

            // 🔥 MORE CREATIVE
            temperature:
              config.temperature ?? 0.8,

            max_tokens:
              config.maxTokens ?? 2500,
          }
        );

      return (
        res?.choices?.[0]?.message
          ?.content || ""
      );
    } catch (err) {
      console.error(
        "Model failed:",
        model,
        err?.status
      );

      // payment issue
      if (err.status === 402) {
        continue;
      }

      // rate limit
      if (
        err.status === 429 ||
        err.status === 503
      ) {
        await new Promise((r) =>
          setTimeout(r, 1500)
        );

        continue;
      }
    }
  }

  return "⚠️ AI service is temporarily unavailable.";
};

// CHAT WITH CONTEXT
export const chatWithContext = async (
  question,
  chunks = []
) => {
  const context = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.content}`
    )
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

  return (
    output || "No answer generated."
  );
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
  async (text) => {
    // randomize content
    const words = text.split(" ");

    const randomStart = Math.floor(
      Math.random() *
        Math.max(
          1,
          words.length - 12000
        )
    );

    const randomText = words
      .slice(randomStart, randomStart + 12000)
      .join(" ");

    const prompt = `
Create EXACTLY 10 UNIQUE flashcards.

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
      await generateContentWithRetry(
        prompt,
        {
          temperature: 0.9,
          maxTokens: 2000,
        }
      );

    console.log(
      "RAW FLASHCARD RESPONSE:"
    );

    console.log(output);

    const parsed =
      safeJSONParse(output);

    return parsed
      .slice(0, 10)
      .map((card) => ({
        question:
          card.question || "",

        answer: card.answer || "",
      }));
  };

// QUIZ GENERATOR
export const generateQuiz = async (
  text,
  numQuestions = 5
) => {
  // 🔥 RANDOMIZE CONTENT
  const words = text.split(" ");

  const randomStart = Math.floor(
    Math.random() *
      Math.max(
        1,
        words.length - 12000
      )
  );

  const randomText = words
    .slice(randomStart, randomStart + 12000)
    .join(" ");

  const prompt = `
Create EXACTLY ${numQuestions} UNIQUE multiple choice questions.

Rules:
- Return ONLY a valid JSON array
- Questions must NOT repeat
- Make questions varied and intelligent
- Include conceptual, factual, and analytical questions
- Avoid similar wording
- Use different difficulty levels

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
- explanation should be concise
- Questions MUST come from the provided text
- Options should look realistic

Text:
${randomText}
`;

  const output =
    await generateContentWithRetry(
      prompt,
      {
        temperature: 0.95,
        maxTokens: 3000,
      }
    );

  console.log(
    "RAW QUIZ AI RESPONSE:"
  );

  console.log(output);

  const parsed =
    safeJSONParse(output);

  return parsed
    .slice(0, numQuestions)
    .map((q) => ({
      question:
        q.question || "",

      options:
        Array.isArray(q.options) &&
        q.options.length === 4
          ? q.options
          : [],

      correctAnswer:
        q.correctAnswer || "",

      explanation:
        q.explanation ||
        `The correct answer is: ${q.correctAnswer}`,
    }));
};