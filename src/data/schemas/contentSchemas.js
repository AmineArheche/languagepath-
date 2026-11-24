import { z } from "zod";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2"];

export const BaseItemSchema = z.object({
  id: z
    .string()
    .min(3, "ID must be at least 3 characters long")
    .regex(/^[a-z0-9\-_]+$/i, "ID must contain only alphanumeric characters, dashes, or underscores"),
  level: z.enum(["A1", "A2", "B1", "B2"]),
  topic: z.string().min(1, "Topic is required").default("General"),
  tags: z.array(z.string()).default([]),
  source: z.string().default("deutschpath-core"),
  reviewedBy: z.enum(["ai", "human"]).default("ai")
});

/**
 * 1. Flashcard Schema
 * Includes noun article/gender/plural consistency and example sentence headword validation.
 */
export const FlashcardSchema = BaseItemSchema.extend({
  german: z.string().min(1, "German headword is required"),
  article: z.enum(["der", "die", "das"]).nullable().optional(),
  gender: z.enum(["masculine", "feminine", "neuter"]).nullable().optional(),
  english: z.string().min(1, "English translation is required"),
  plural: z.string().optional().default("-"),
  exampleDe: z.string().min(3, "German example sentence is required"),
  exampleEn: z.string().min(3, "English example translation is required"),
  category: z.string().optional(),
  unit: z.string().optional()
}).superRefine((data, ctx) => {
  // 1. Article & Gender Alignment
  if (data.article) {
    const expectedGender = {
      der: "masculine",
      die: "feminine",
      das: "neuter"
    }[data.article];

    if (data.gender && data.gender !== expectedGender) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Article '${data.article}' does not match gender '${data.gender}' (expected '${expectedGender}')`,
        path: ["gender"]
      });
    }

    // Nouns with articles must define a plural form (or "-" if uncountable)
    if (!data.plural || data.plural.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Nouns with article '${data.article}' must specify a plural form (or '-' if uncountable)`,
        path: ["plural"]
      });
    }
  }

  // 2. Example sentence must contain headword (or root/stem)
  if (data.german && data.exampleDe) {
    const cleanHeadword = data.german.trim().toLowerCase().replace(/^(der|die|das)\s+/, "");
    const headwordStem = cleanHeadword.length > 4 ? cleanHeadword.slice(0, -2) : cleanHeadword;
    const exampleLower = data.exampleDe.toLowerCase();

    const normalizedStem = headwordStem
      .replace(/ä/g, "a")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u");
    const normalizedExample = exampleLower
      .replace(/ä/g, "a")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u");

    if (
      !exampleLower.includes(cleanHeadword) &&
      !exampleLower.includes(headwordStem) &&
      !normalizedExample.includes(normalizedStem)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `German example sentence must contain the headword '${data.german}'`,
        path: ["exampleDe"]
      });
    }
  }
});

/**
 * 2. Grammar Exercise Schema
 * Supports fill-blank, multiple-choice, and sentence-order exercise modalities.
 */
export const GrammarExerciseSchema = BaseItemSchema.extend({
  type: z.enum(["fill-blank", "multiple-choice", "sentence-order"]).default("fill-blank"),
  topicLabel: z.string().min(1, "Topic label is required"),
  prompt: z.string().min(3, "Exercise prompt is required"),
  options: z.array(z.string()).min(2, "At least 2 options are required").optional(),
  correctAnswer: z.string().min(1, "Correct answer is required").optional(),
  words: z.array(z.string()).min(2, "Sentence order requires at least 2 words").optional(),
  correctOrder: z.array(z.string()).min(2, "Sentence order requires correctOrder array").optional(),
  explanation: z.string().min(5, "Pedagogical explanation is required")
}).superRefine((data, ctx) => {
  if (data.type === "sentence-order") {
    if (!data.words || data.words.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sentence order exercise must have at least 2 words",
        path: ["words"]
      });
    }
    if (!data.correctOrder || data.correctOrder.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sentence order exercise must specify correctOrder",
        path: ["correctOrder"]
      });
    }
  } else {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Multiple choice or fill-blank exercise must have at least 2 options",
        path: ["options"]
      });
    }
    if (!data.correctAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exercise must have a correct answer",
        path: ["correctAnswer"]
      });
    } else if (data.options && !data.options.includes(data.correctAnswer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Options list must contain the correct answer '${data.correctAnswer}'`,
        path: ["correctAnswer"]
      });
    }
  }
});

/**
 * 3. Reading Text Schema
 */
export const ReadingQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(5, "Question text is required"),
  options: z.array(z.string()).min(2, "At least 2 options required per comprehension question"),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(5),
  evidence: z
    .object({
      start: z.number().int().min(0),
      end: z.number().int().min(0),
      text: z.string().optional()
    })
    .optional(),
  distractorRationale: z.record(z.string(), z.string()).optional(),
  errorCategory: z.string().optional()
});

export const ReadingTextSchema = BaseItemSchema.extend({
  title: z.string().min(2, "German title is required"),
  englishTitle: z.string().min(2, "English title is required"),
  category: z.string().default("General"),
  estimatedReadTime: z.string().default("2 min"),
  content: z.string().min(50, "Reading passage must contain at least 50 characters"),
  vocabulary: z.record(z.string(), z.any()).default({}),
  questions: z.array(ReadingQuestionSchema).min(1, "At least one comprehension question is required")
});

/**
 * 4. Listening Item Schema
 */
export const ListeningItemSchema = BaseItemSchema.extend({
  audioTranscript: z.string().min(20, "Audio transcript is required"),
  dialogueSpeaker: z.string().default("Native Speaker"),
  audioFileUrl: z.string().optional(),
  questions: z.array(ReadingQuestionSchema).min(1)
});

/**
 * 5. Exam Task Schema
 */
export const ExamTaskSchema = BaseItemSchema.extend({
  module: z.enum(["lesen", "hoeren", "schreiben", "sprechen"]),
  maxPoints: z.number().int().positive().default(25),
  taskDescription: z.string().min(10, "Task description is required"),
  instructions: z.string().min(5),
  scoringRubric: z.record(z.string(), z.any()).default({})
});

/**
 * 6. Writing Prompt Schema
 */
export const WritingPromptSchema = BaseItemSchema.extend({
  title: z.string().min(3, "Prompt title is required"),
  prompt: z.string().min(10, "Task prompt description is required"),
  targetWords: z.string().default("30 - 50 words"),
  hints: z.array(z.string()).default([])
});

/**
 * 7. Human-Review Queue Item Schema
 */
export const ReviewQueueItemSchema = z.object({
  queueId: z.string(),
  itemType: z.enum(["flashcard", "grammar", "reading", "listening", "exam", "writing"]),
  status: z.enum(["draft", "approved", "rejected"]).default("draft"),
  draftedAt: z.string().default(() => new Date().toISOString()),
  reviewedAt: z.string().nullable().optional(),
  reviewerNotes: z.string().optional(),
  item: z.any()
});

/**
 * Schema registry map
 */
export const SCHEMA_MAP = {
  flashcard: FlashcardSchema,
  grammar: GrammarExerciseSchema,
  reading: ReadingTextSchema,
  listening: ListeningItemSchema,
  exam: ExamTaskSchema,
  writing: WritingPromptSchema,
  queueItem: ReviewQueueItemSchema
};

/**
 * Validates a content item against its type schema
 */
export function validateItem(type, item) {
  const schema = SCHEMA_MAP[type];
  if (!schema) {
    throw new Error(`Unknown content schema type: '${type}'`);
  }
  return schema.safeParse(item);
}
