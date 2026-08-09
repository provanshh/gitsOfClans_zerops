const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb, getCityByUrl, getCityById, saveCity, getSummary, saveSummary } = require('./db');
const { processRepository } = require('./github');
const { generateFileSummary } = require('./summarize');
const { handleCodeEdit } = require('./editCode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database connection and tables
initDb().catch(err => console.error('[InitDB] Failed:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'repocity-api', timestamp: new Date().toISOString() });
});

// Helper function to process single repo with cache
async function getOrProcessRepo(repoUrl) {
  const cachedCity = await getCityByUrl(repoUrl);
  if (cachedCity) {
    console.log(`[Cache Hit] ${repoUrl}`);
    return {
      id: cachedCity.id,
      owner: cachedCity.owner,
      repo: cachedCity.repo,
      repo_url: cachedCity.repo_url,
      total_files: cachedCity.total_files,
      total_lines: cachedCity.total_lines,
      layout_json: typeof cachedCity.layout_json === 'string' ? JSON.parse(cachedCity.layout_json) : cachedCity.layout_json,
      cached: true
    };
  }

  console.log(`[Cache Miss] Processing ${repoUrl}...`);
  const result = await processRepository(repoUrl);
  const savedCity = await saveCity({
    repoUrl: repoUrl,
    owner: result.owner,
    repo: result.repo,
    totalFiles: result.totalFiles,
    totalLines: result.totalLines,
    layoutJson: result.layoutJson
  });

  return {
    id: savedCity.id,
    owner: savedCity.owner,
    repo: savedCity.repo,
    repo_url: savedCity.repo_url,
    total_files: savedCity.total_files,
    total_lines: savedCity.total_lines,
    layout_json: typeof savedCity.layout_json === 'string' ? JSON.parse(savedCity.layout_json) : savedCity.layout_json,
    cached: false
  };
}

// POST /city - Parse single or comma-separated repos and return city clan layout(s)
app.post('/city', async (req, res) => {
  try {
    const { repo_url } = req.body;
    if (!repo_url) {
      return res.status(400).json({ error: 'repo_url is required.' });
    }

    const urls = repo_url
      .split(',')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) {
      return res.status(400).json({ error: 'No valid repository URLs provided.' });
    }

    const results = [];
    const errors = [];

    for (const url of urls.slice(0, 5)) {
      try {
        const cityData = await getOrProcessRepo(url);
        results.push(cityData);
      } catch (err) {
        console.error(`[POST /city] Error processing ${url}:`, err.message);
        errors.push({ repo_url: url, error: err.message });
      }
    }

    if (results.length === 0) {
      return res.status(500).json({
        error: errors.map(e => `${e.repo_url}: ${e.error}`).join(' | ') || 'Failed to process repository city layouts.'
      });
    }

    return res.json({
      clans: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('[POST /city] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process repository city layout.' });
  }
});

// GET /city/:id - Retrieve cached city JSON by ID
app.get('/city/:id', async (req, res) => {
  try {
    const city = await getCityById(req.params.id);
    if (!city) {
      return res.status(404).json({ error: 'City layout not found.' });
    }

    res.json({
      id: city.id,
      owner: city.owner,
      repo: city.repo,
      repo_url: city.repo_url,
      total_files: city.total_files,
      total_lines: city.total_lines,
      layout_json: typeof city.layout_json === 'string' ? JSON.parse(city.layout_json) : city.layout_json
    });
  } catch (err) {
    console.error('[GET /city/:id] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve city layout.' });
  }
});

// POST /summarize - On-demand AI summarization of specific code file
app.post('/summarize', async (req, res) => {
  try {
    const { city_id, file_path, file_content, model } = req.body;
    
    if (!file_path) {
      return res.status(400).json({ error: 'file_path is required.' });
    }

    const numericCityId = city_id ? parseInt(city_id, 10) : 0;

    if (numericCityId) {
      const cachedSummary = await getSummary(numericCityId, file_path);
      if (cachedSummary) {
        console.log(`[POST /summarize] Cache hit for city ${numericCityId} file ${file_path}`);
        return res.json({ summary: cachedSummary, cached: true });
      }
    }

    console.log(`[POST /summarize] Cache miss for ${file_path}. Calling AI API...`);
    const summary = await generateFileSummary(file_path, file_content || '');

    if (numericCityId) {
      await saveSummary(numericCityId, file_path, summary);
    }

    res.json({ summary, cached: false, model: model || 'Claude 3.5 Sonnet' });
  } catch (err) {
    console.error('[POST /summarize] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate file summary.' });
  }
});

// POST /summarize-pr - On-demand AI PR review summary
app.post('/summarize-pr', async (req, res) => {
  try {
    const { pr_title, pr_number, head_branch, base_branch, model } = req.body;
    const promptText = `Pull Request #${pr_number}: ${pr_title} (Branch: ${head_branch} -> ${base_branch})`;
    const summary = await generateFileSummary(`PR #${pr_number}`, promptText);

    res.json({
      summary: `PR #${pr_number} Review (${model || 'Claude 3.5 Sonnet'}): ${summary}`,
      model: model || 'Claude 3.5 Sonnet'
    });
  } catch (err) {
    console.error('[POST /summarize-pr] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate PR summary.' });
  }
});

// POST /edit-file - Interactive AI Code Modification Endpoint with custom API key support
app.post('/edit-file', async (req, res) => {
  try {
    const { file_path, file_content, prompt, crew_model, api_key, base_url, model, provider } = req.body;
    if (!file_path || !prompt) {
      return res.status(400).json({ error: 'file_path and prompt are required.' });
    }

    console.log(`[POST /edit-file] Processing edit for ${file_path} with prompt: "${prompt}"`);
    const result = await handleCodeEdit(file_path, file_content || '', prompt, crew_model, {
      apiKey: api_key,
      baseUrl: base_url,
      model: model,
      provider: provider
    });

    res.json(result);
  } catch (err) {
    console.error('[POST /edit-file] Error:', err.message);
    res.status(500).json({ error: 'Failed to apply code modifications.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RepoCity / Gits of Clans API server running on port ${PORT}`);
});
