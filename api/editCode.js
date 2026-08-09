require('dotenv').config();

const DEFAULT_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

async function handleCodeEdit(filePath, fileContent, prompt, crewModel = 'Worker', customConfig = {}) {
  const originalCode = fileContent || '';
  const originalLines = originalCode ? originalCode.split(/\r\n|\r|\n/).length : 0;

  const apiKey = customConfig.apiKey || DEFAULT_OPENROUTER_KEY;
  const baseUrl = customConfig.baseUrl || 'https://openrouter.ai/api/v1';
  const selectedModel = customConfig.model || 'openai/gpt-4o';

  if (!apiKey) {
    return {
      error: 'NO_API_KEY',
      message: 'No OpenRouter API key configured. Please set your API key in the settings panel.',
      modified_code: null,
      explanation: null,
      additions: 0,
      deletions: 0,
      new_lines_of_code: originalLines
    };
  }

  // Construct full completions URL
  const endpoint = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  console.log(`[EditCode] Calling OpenRouter API at ${endpoint} with model ${selectedModel}...`);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://gitsofclans.app',
        'X-OpenRouter-Title': 'Gits of Clans',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: `You are an expert developer crew member (${crewModel}) in Gits of Clans. Modify the provided source code according to the user's prompt.
Return ONLY valid JSON matching this exact structure (no markdown fences, no extra text):
{
  "modified_code": "complete updated source code as a single string",
  "explanation": "concise 1-2 sentence description of what was added or changed",
  "additions": <number of lines added>,
  "deletions": <number of lines removed>
}`
          },
          {
            role: 'user',
            content: `File Path: ${filePath}\nOriginal Code:\n\`\`\`\n${originalCode.substring(0, 4000)}\n\`\`\`\n\nPrompt Order: ${prompt}`
          }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.error?.message || data.message || `HTTP ${res.status}`;
      console.error(`[EditCode] OpenRouter API Error (${res.status}):`, errMsg);
      return {
        error: 'API_ERROR',
        message: `OpenRouter API Error (${res.status}): ${errMsg}`,
        modified_code: null,
        explanation: null,
        additions: 0,
        deletions: 0,
        new_lines_of_code: originalLines
      };
    }

    const content = data.choices?.[0]?.message?.content || '';
    console.log(`[EditCode] OpenRouter response received (${content.length} chars)`);

    // Parse JSON output
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const newCode = parsed.modified_code || originalCode;
      const newLines = newCode.split(/\r\n|\r|\n/).length;
      return {
        modified_code: newCode,
        explanation: parsed.explanation || `Modified ${filePath} via ${selectedModel}.`,
        additions: Number(parsed.additions) || Math.max(1, newLines - originalLines),
        deletions: Number(parsed.deletions) || 0,
        new_lines_of_code: newLines
      };
    }

    // Raw code fallback
    if (content.trim()) {
      const cleanCode = content.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const newLines = cleanCode.split(/\r\n|\r|\n/).length;
      return {
        modified_code: cleanCode,
        explanation: `Applied changes to ${filePath} via ${selectedModel}.`,
        additions: Math.max(1, newLines - originalLines),
        deletions: 0,
        new_lines_of_code: newLines
      };
    }

    return {
      error: 'EMPTY_RESPONSE',
      message: `OpenRouter returned an empty response for model ${selectedModel}`,
      modified_code: null,
      explanation: null,
      additions: 0,
      deletions: 0,
      new_lines_of_code: originalLines
    };

  } catch (err) {
    console.error(`[EditCode] Network/Fetch Error:`, err.message);
    return {
      error: 'NETWORK_ERROR',
      message: `OpenRouter Network Error: ${err.message}`,
      modified_code: null,
      explanation: null,
      additions: 0,
      deletions: 0,
      new_lines_of_code: originalLines
    };
  }
}

module.exports = {
  handleCodeEdit
};
