import type { OpenAIRequest, OpenAIResponse } from '../types/api.types';

/**
 * Load system prompt from file or use fallback
 */
export async function loadSystemPrompt(): Promise<string> {
  try {
    const response = await fetch('/ai_system_prompt.txt');
    if (!response.ok) {
      throw new Error('Failed to load system prompt');
    }
    const template = await response.text();
    return template;
  } catch (error) {
    console.warn('Failed to load ai_system_prompt.txt, using fallback');
    return getFallbackSystemPrompt();
  }
}

/**
 * Fallback system prompt
 */
function getFallbackSystemPrompt(): string {
  return `You are an expert game item designer. Generate detailed, balanced game items in JSON format.

The item structure:
- weight: number (item weight)
- name: string (item name)
- ico: string (icon path)
- description: string
- points: array of {x, y} grid points for item shape
- tags: array of strings (item, weapon, hasCooldown, charges, aura, cripRef, chargesRef)
- stats: array of {name, value} stats
- charges: optional array of {name, value} charges
- logic: optional array of logic nodes (triggers, checkers, activators, conditionals, auras)

Logic node types:
- trigger: activation conditions (cooldown, itemActivated, etc.)
- checker: validation (cooldown, chargePrice, etc.)
- activator: actions (damage, heal, spawner, etc.)
- conditional: target filters (characterRelative, characterRandom, etc.)
- aura: passive stat modifiers
- counter: scaling effects

Create balanced, interesting items that fit the user's description. Return ONLY valid JSON.`;
}

/**
 * Generate item with OpenAI API
 */
export async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  model: string
): Promise<any> {
  const systemPrompt = await loadSystemPrompt();

  const request: OpenAIRequest = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
    );
  }

  const data: OpenAIResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from API');
  }

  const content = data.choices[0].message.content;
  return JSON.parse(content);
}
