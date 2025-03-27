import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createFireworks } from '@ai-sdk/fireworks';
import { createOpenAI } from '@ai-sdk/openai';
import {
  extractReasoningMiddleware,
  LanguageModelV1,
  LanguageModelV1CallOptions,
  wrapLanguageModel,
} from 'ai';
import { getEncoding } from 'js-tiktoken';

import { RecursiveCharacterTextSplitter } from './text-splitter';

// Providers
const openai = process.env.OPENAI_KEY
  ? createOpenAI({
      apiKey: process.env.OPENAI_KEY,
      baseURL: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1',
    })
  : undefined;

const fireworks = process.env.FIREWORKS_KEY
  ? createFireworks({
      apiKey: process.env.FIREWORKS_KEY,
    })
  : undefined;

const bedrock = process.env.AWS_REGION
  ? createAmazonBedrock({
      // Explicitly pass credentials and region from environment variables
      // as required by @ai-sdk/amazon-bedrock v2.x+
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN, // Pass even if undefined
    })
  : undefined;

const customModel = process.env.CUSTOM_MODEL
  ? openai?.(process.env.CUSTOM_MODEL, {
      structuredOutputs: true,
    })
  : undefined;

// Models

const bedrockClaudeSonnetModel = bedrock
  ? bedrock(
      'anthropic.claude-3-7-sonnet-20250219-v1:0',
      // Note: Enabling 'extended thinking' via the AI SDK might require
      // specific parameters not added here. This uses default settings.
      // The BEDROCK_THINKING_BUDGET env var is currently not used.
    )
  : undefined;

const o3MiniModel = openai?.('o3-mini', {
  reasoningEffort: 'medium',
  structuredOutputs: true,
});

const deepSeekR1Model = fireworks
  ? wrapLanguageModel({
      model: fireworks(
        'accounts/fireworks/models/deepseek-r1',
      ) as LanguageModelV1,
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    })
  : undefined;

export function getModel(): LanguageModelV1 {
  // Prioritize Bedrock, then Custom, then Fireworks R1, then OpenAI O3 Mini
  if (bedrockClaudeSonnetModel) {
    console.log('Using AWS Bedrock Claude 3.7 Sonnet model');
    // Note: The AI SDK might automatically handle structured outputs for Bedrock/Claude,
    // but if issues arise, wrapping with middleware might be needed similar to deepSeekR1Model.
    return bedrockClaudeSonnetModel as LanguageModelV1;
  }

  if (customModel) {
    console.log(`Using Custom OpenAI model: ${process.env.CUSTOM_MODEL}`);
    return customModel;
  }

  if (deepSeekR1Model) {
    console.log('Using Fireworks DeepSeek R1 model');
    return deepSeekR1Model;
  }

  if (o3MiniModel) {
    console.log('Using OpenAI O3 Mini model');
    return o3MiniModel;
  }

  throw new Error(
    'No LLM provider configured. Please set AWS_REGION, FIREWORKS_KEY, or OPENAI_KEY environment variables.',
  );
}

// Helper to check if Bedrock is the active provider
export function isBedrockActive(): boolean {
  return !!bedrockClaudeSonnetModel;
}

const MinChunkSize = 140;
const encoder = getEncoding('o200k_base');

// trim prompt to maximum context size
export function trimPrompt(
  prompt: string,
  contextSize = Number(process.env.CONTEXT_SIZE) || 128_000, // Default context, might need adjustment per model
) {
  if (!prompt) {
    return '';
  }

  // TODO: Consider making contextSize dynamic based on the selected model in getModel()
  // Claude 3.7 Sonnet has 200K context, but requests might be limited differently.
  // The current 128k default might be safe.

  const length = encoder.encode(prompt).length;
  if (length <= contextSize) {
    return prompt;
  }

  const overflowTokens = length - contextSize;
  // on average it's 3 characters per token, so multiply by 3 to get a rough estimate of the number of characters
  const chunkSize = prompt.length - overflowTokens * 3;
  if (chunkSize < MinChunkSize) {
    // If calculated chunk size is too small, just take the first MinChunkSize characters
    // This prevents overly aggressive trimming on very large overflows.
    console.warn(
      `Calculated chunk size (${chunkSize}) too small, trimming to ${MinChunkSize} characters.`,
    );
    return prompt.slice(0, MinChunkSize);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 0, // No overlap needed for simple trimming
  });
  const trimmedPrompt = splitter.splitText(prompt)[0] ?? '';

  // last catch, there's a chance that the trimmed prompt is same length as the original prompt, due to how tokens are split & innerworkings of the splitter, handle this case by just doing a hard cut
  if (trimmedPrompt.length === prompt.length && prompt.length > 0) {
    console.warn(
      'Splitter did not reduce prompt length, performing hard cut.',
    );
    // Perform a hard cut based on estimated character count per token
    const estimatedCharsToKeep = contextSize * 3; // Rough estimate
    return prompt.slice(0, Math.min(prompt.length, estimatedCharsToKeep));
  }

  // recursively trim until the prompt is within the context size
  // Add a check to prevent infinite recursion if trimming doesn't reduce length
  if (trimmedPrompt.length < prompt.length) {
    return trimPrompt(trimmedPrompt, contextSize);
  } else {
    // If trimming didn't help (e.g., single huge token?), return the trimmed (or original) prompt
    // This prevents infinite loops in edge cases.
    console.warn('Trimming did not reduce prompt length significantly.');
    return trimmedPrompt;
  }
}
