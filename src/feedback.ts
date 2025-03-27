import { generateObject } from 'ai';
import { z } from 'zod';

import { getModel, isBedrockActive } from './ai/providers';
import { systemPrompt } from './prompt';

// Helper to construct Bedrock provider options for reasoning
// Duplicated from deep-research.ts for simplicity, could be refactored
function getBedrockProviderOptions() {
  if (!isBedrockActive()) {
    return undefined;
  }
  const budgetTokens = Math.max(
    1024,
    parseInt(process.env.BEDROCK_THINKING_BUDGET || '4000', 10),
  );
  return {
    bedrock: {
      reasoningConfig: { type: 'enabled', budgetTokens },
    },
  };
}

export async function generateFeedback({
  query,
  numQuestions = 3,
}: {
  query: string;
  numQuestions?: number;
}) {
  const userFeedback = await generateObject({
    model: getModel(),
    system: systemPrompt(),
    prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear: <query>${query}</query>`,
    schema: z.object({
      questions: z
        .array(z.string())
        .describe(
          `Follow up questions to clarify the research direction, max of ${numQuestions}`,
        ),
    }),
    providerOptions: getBedrockProviderOptions(),
  });

  return userFeedback.object.questions.slice(0, numQuestions);
}
