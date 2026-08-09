const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let pool = null;
let useInMemoryDb = false;

// In-memory fallback if Postgres is not running locally
const inMemoryCities = new Map(); // repo_url -> city object
const inMemorySummaries = new Map(); // `${city_id}:${file_path}` -> summary string
let nextCityId = 1;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });
} else {
  console.log('[DB] No DATABASE_URL provided. Using in-memory fallback store.');
  useInMemoryDb = true;
}

async function initDb() {
  if (useInMemoryDb || !pool) return;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS cities (
          id SERIAL PRIMARY KEY,
          repo_url TEXT UNIQUE NOT NULL,
          owner TEXT NOT NULL,
          repo TEXT NOT NULL,
          total_files INT NOT NULL,
          total_lines INT NOT NULL,
          layout_json JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS file_summaries (
          id SERIAL PRIMARY KEY,
          city_id INT REFERENCES cities(id) ON DELETE CASCADE,
          file_path TEXT NOT NULL,
          summary TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_city_file UNIQUE (city_id, file_path)
        );
      `);
      console.log('[DB] Database schema initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[DB] Could not connect to PostgreSQL. Falling back to in-memory store:', err.message);
    useInMemoryDb = true;
  }
}

async function getCityByUrl(repoUrl) {
  const normalizedUrl = repoUrl.trim().toLowerCase().replace(/\/+$/, '');
  if (useInMemoryDb || !pool) {
    return inMemoryCities.get(normalizedUrl) || null;
  }
  try {
    const res = await pool.query('SELECT * FROM cities WHERE repo_url = $1', [normalizedUrl]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (err) {
    console.error('[DB] Error fetching city by url:', err.message);
    return inMemoryCities.get(normalizedUrl) || null;
  }
}

async function getCityById(id) {
  const numericId = parseInt(id, 10);
  if (useInMemoryDb || !pool) {
    for (const city of inMemoryCities.values()) {
      if (city.id === numericId) return city;
    }
    return null;
  }
  try {
    const res = await pool.query('SELECT * FROM cities WHERE id = $1', [numericId]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('[DB] Error fetching city by id:', err.message);
    for (const city of inMemoryCities.values()) {
      if (city.id === numericId) return city;
    }
    return null;
  }
}

async function saveCity({ repoUrl, owner, repo, totalFiles, totalLines, layoutJson }) {
  const normalizedUrl = repoUrl.trim().toLowerCase().replace(/\/+$/, '');
  if (useInMemoryDb || !pool) {
    const city = {
      id: nextCityId++,
      repo_url: normalizedUrl,
      owner,
      repo,
      total_files: totalFiles,
      total_lines: totalLines,
      layout_json: layoutJson,
      created_at: new Date().toISOString()
    };
    inMemoryCities.set(normalizedUrl, city);
    return city;
  }

  try {
    const res = await pool.query(
      `INSERT INTO cities (repo_url, owner, repo, total_files, total_lines, layout_json)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (repo_url) DO UPDATE
       SET total_files = EXCLUDED.total_files,
           total_lines = EXCLUDED.total_lines,
           layout_json = EXCLUDED.layout_json
       RETURNING *`,
      [normalizedUrl, owner, repo, totalFiles, totalLines, JSON.stringify(layoutJson)]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[DB] Error saving city to database:', err.message);
    const city = {
      id: nextCityId++,
      repo_url: normalizedUrl,
      owner,
      repo,
      total_files: totalFiles,
      total_lines: totalLines,
      layout_json: layoutJson,
      created_at: new Date().toISOString()
    };
    inMemoryCities.set(normalizedUrl, city);
    return city;
  }
}

async function getSummary(cityId, filePath) {
  const key = `${cityId}:${filePath}`;
  if (useInMemoryDb || !pool) {
    return inMemorySummaries.get(key) || null;
  }

  try {
    const res = await pool.query(
      'SELECT summary FROM file_summaries WHERE city_id = $1 AND file_path = $2',
      [cityId, filePath]
    );
    if (res.rows.length > 0) {
      return res.rows[0].summary;
    }
    return null;
  } catch (err) {
    console.error('[DB] Error getting summary:', err.message);
    return inMemorySummaries.get(key) || null;
  }
}

async function saveSummary(cityId, filePath, summary) {
  const key = `${cityId}:${filePath}`;
  if (useInMemoryDb || !pool) {
    inMemorySummaries.set(key, summary);
    return summary;
  }

  try {
    await pool.query(
      `INSERT INTO file_summaries (city_id, file_path, summary)
       VALUES ($1, $2, $3)
       ON CONFLICT (city_id, file_path) DO UPDATE
       SET summary = EXCLUDED.summary`,
      [cityId, filePath, summary]
    );
    return summary;
  } catch (err) {
    console.error('[DB] Error saving summary:', err.message);
    inMemorySummaries.set(key, summary);
    return summary;
  }
}

module.exports = {
  initDb,
  getCityByUrl,
  getCityById,
  saveCity,
  getSummary,
  saveSummary
};
