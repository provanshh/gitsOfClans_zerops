require('dotenv').config();

const DEFAULT_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

async function generateFileSummary(filePath, fileContent, customConfig = {}) {
  const apiKey = customConfig.apiKey || DEFAULT_OPENROUTER_KEY;
  const baseUrl = customConfig.baseUrl || 'https://openrouter.ai/api/v1';
  const selectedModel = customConfig.model || 'openai/gpt-4o';

  const sampleContent = fileContent ? fileContent.substring(0, 3500) : '// Empty or unreadable file content';
  const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

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
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'You are an expert developer assistant. Provide a clear, concise 2 to 3 sentence plain-English summary explaining what this source code file does.'
          },
          {
            role: 'user',
            content: `File Path: ${filePath}\n\nFile Content:\n${sampleContent}`
          }
        ]
      })
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (content) {
      return content;
    }
  } catch (err) {
    console.error('[Summarize] OpenRouter call error:', err.message);
  }

  const fileName = filePath.split('/').pop();
  const cleanContent = fileContent ? fileContent.trim() : '';
  const lineCount = cleanContent ? cleanContent.split('\n').length : 0;
  return `This file (${fileName}) at \`${filePath}\` contains ${lineCount} lines of code. It provides core functionality for ${filePath.split('/')[0] || 'the application'} and handles module exports.`;
}

module.exports = {
  generateFileSummary
};
