const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const EXTENSION_COLORS = {
  'js': '#f7df1e',
  'jsx': '#00f0ff',
  'ts': '#3178c6',
  'tsx': '#00a2ff',
  'py': '#00ffd1',
  'ipynb': '#ff9900',
  'html': '#ff6b00',
  'htm': '#ff6b00',
  'css': '#ff2a85',
  'scss': '#ff2a85',
  'less': '#ff2a85',
  'vue': '#42b883',
  'svelte': '#ff3e00',
  'json': '#00ff88',
  'yaml': '#a7f3d0',
  'yml': '#a7f3d0',
  'toml': '#00ff88',
  'xml': '#f59e0b',
  'env': '#10b981',
  'md': '#94a3b8',
  'mdx': '#cbd5e1',
  'txt': '#64748b',
  'go': '#00add8',
  'rs': '#ff5500',
  'java': '#a855f7',
  'c': '#6366f1',
  'cpp': '#8b5cf6',
  'h': '#a855f7',
  'hpp': '#a855f7',
  'cs': '#9333ea',
  'php': '#8892bf',
  'rb': '#cc342d',
  'swift': '#f05138',
  'kt': '#7f52ff',
  'sh': '#4ae183',
  'bash': '#4ae183',
  'sql': '#e2e8f0',
  'dockerfile': '#2496ed',
  'default': '#64748b'
};

function parseRepoUrl(inputUrl) {
  if (!inputUrl) throw new Error('Repository URL is required.');

  let clean = inputUrl.trim();
  clean = clean.replace(/^git@github\.com:/, 'https://github.com/');
  clean = clean.replace(/\.git$/, '');
  clean = clean.replace(/\/+$/, '');

  const match = clean.match(/(?:github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  if (!match) {
    throw new Error('Invalid GitHub repository URL. Format should be: https://github.com/owner/repo or owner/repo');
  }

  return {
    owner: match[1],
    repo: match[2]
  };
}

function fetchJson(url, redirectCount = 0) {
  if (redirectCount > 5) {
    return Promise.reject(new Error(`Too many redirects when fetching ${url}`));
  }

  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'RepoCity-App (https://github.com/repocity)',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    https.get(url, options, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchJson(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Failed to parse JSON response from ${url}: ${err.message}`));
          }
        } else {
          try {
            const parsedErr = JSON.parse(data);
            reject(new Error(parsedErr.message || `GitHub API returned status ${res.statusCode}`));
          } catch {
            reject(new Error(`GitHub API returned status ${res.statusCode}: ${data.substring(0, 200)}`));
          }
        }
      });
    }).on('error', (err) => reject(err));
  });
}

function fetchRawText(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.resolve('');

  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'RepoCity-App'
      }
    };
    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    https.get(url, options, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchRawText(res.headers.location, redirectCount + 1).then(resolve);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

function isExcludedFile(path) {
  const lower = path.toLowerCase();
  
  const excludedDirs = [
    'node_modules/', '.git/', 'dist/', 'build/', '.github/',
    'coverage/', '.next/', 'vendor/', 'out/', 'target/', '.cache/',
    'bin/', 'obj/', '.vscode/', '.idea/', '__pycache__/'
  ];
  if (excludedDirs.some(dir => lower.includes(dir))) return true;

  const excludedFiles = [
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'cargo.lock',
    'gemfile.lock', 'composer.lock', 'go.sum', '.ds_store'
  ];
  const filename = lower.split('/').pop();
  if (excludedFiles.includes(filename)) return true;
  if (filename.endsWith('.min.js') || filename.endsWith('.min.css') || filename.endsWith('.map')) return true;

  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'webp', 'avif', 'bmp', 'tiff',
    'pdf', 'zip', 'gz', 'tgz', 'tar', '7z', 'rar', 'exe', 'dll', 'so', 'dylib',
    'woff', 'woff2', 'ttf', 'eot', 'otf', 'mp3', 'mp4', 'wav', 'avi', 'mov',
    'pyc', 'pyo', 'class', 'o', 'a', 'db', 'sqlite', 'wasm'
  ];
  const ext = filename.includes('.') ? filename.split('.').pop() : '';
  if (binaryExtensions.includes(ext)) return true;

  return false;
}

function getLanguageAndColor(filepath) {
  const filename = filepath.split('/').pop().toLowerCase();
  
  if (filename === 'dockerfile') return { language: 'Docker', color: EXTENSION_COLORS['dockerfile'] };
  if (filename.startsWith('.env')) return { language: 'Env Config', color: EXTENSION_COLORS['env'] };

  const ext = filename.includes('.') ? filename.split('.').pop() : '';
  const color = EXTENSION_COLORS[ext] || EXTENSION_COLORS['default'];
  
  const langMap = {
    'js': 'JavaScript', 'jsx': 'React JSX', 'ts': 'TypeScript', 'tsx': 'React TSX',
    'py': 'Python', 'ipynb': 'Jupyter Notebook', 'html': 'HTML', 'css': 'CSS',
    'scss': 'SCSS', 'less': 'LESS', 'vue': 'Vue', 'svelte': 'Svelte',
    'json': 'JSON', 'yaml': 'YAML', 'yml': 'YAML', 'toml': 'TOML', 'xml': 'XML',
    'md': 'Markdown', 'mdx': 'MDX', 'txt': 'Text', 'go': 'Go', 'rs': 'Rust',
    'java': 'Java', 'c': 'C', 'cpp': 'C++', 'h': 'C/C++ Header', 'hpp': 'C++ Header',
    'cs': 'C#', 'php': 'PHP', 'rb': 'Ruby', 'swift': 'Swift', 'kt': 'Kotlin',
    'sh': 'Shell', 'bash': 'Bash', 'sql': 'SQL'
  };

  const language = langMap[ext] || (ext ? ext.toUpperCase() : 'Unknown');
  return { language, color, extension: ext };
}

async function fetchPullRequests(owner, repo) {
  try {
    const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=6`;
    const prs = await fetchJson(prUrl);
    
    if (Array.isArray(prs) && prs.length > 0) {
      return prs.map((pr, idx) => ({
        id: pr.id || idx + 1,
        number: pr.number,
        title: pr.title,
        user: pr.user?.login || 'contributor',
        created_at: pr.created_at,
        html_url: pr.html_url,
        head_branch: pr.head?.ref || 'feature-branch',
        base_branch: pr.base?.ref || 'main',
        additions: Math.floor(Math.random() * 300) + 20,
        deletions: Math.floor(Math.random() * 80) + 5,
        changed_files: Math.floor(Math.random() * 12) + 1
      }));
    }
  } catch (err) {
    console.warn(`[GitHub API] Warning fetching PRs for ${owner}/${repo}:`, err.message);
  }

  // Fallback demo PR ships if repository has no open PRs or unauthenticated
  return [
    {
      id: 101,
      number: 42,
      title: 'Feature: Add Realtime Agent Construction & Model Crew',
      user: 'deepmind-agent',
      created_at: new Date().toISOString(),
      html_url: `https://github.com/${owner}/${repo}/pull/42`,
      head_branch: 'feat/agent-crew',
      base_branch: 'main',
      additions: 340,
      deletions: 42,
      changed_files: 6
    },
    {
      id: 102,
      number: 38,
      title: 'Refactor: Optimize 3D Voxel Archipelago & Ocean Navigation',
      user: 'octocat',
      created_at: new Date().toISOString(),
      html_url: `https://github.com/${owner}/${repo}/pull/38`,
      head_branch: 'refactor/voxel-archipelago',
      base_branch: 'main',
      additions: 195,
      deletions: 88,
      changed_files: 4
    }
  ];
}

async function processRepository(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);

  // 1. Fetch repo info for default branch
  let defaultBranch = 'main';
  try {
    const repoMetaUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoMeta = await fetchJson(repoMetaUrl);
    if (repoMeta.default_branch) {
      defaultBranch = repoMeta.default_branch;
    }
  } catch (err) {
    console.warn(`[GitHub API] Warning fetching repo metadata for ${owner}/${repo}:`, err.message);
  }

  // 2. Fetch full git tree recursively with branch fallbacks
  let treeData = null;
  const branchesToTry = [defaultBranch, 'main', 'master'];
  
  for (const branch of branchesToTry) {
    try {
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      treeData = await fetchJson(treeUrl);
      if (treeData && treeData.tree && Array.isArray(treeData.tree)) {
        defaultBranch = branch;
        break;
      }
    } catch (err) {
      console.warn(`[GitHub API] Branch ${branch} tree fetch failed for ${owner}/${repo}:`, err.message);
    }
  }

  if (!treeData || !treeData.tree || !Array.isArray(treeData.tree)) {
    throw new Error(`Repository git tree for ${owner}/${repo} is empty, private, or unavailable.`);
  }

  // 3. Filter files
  const eligibleFiles = treeData.tree.filter(item => item.type === 'blob' && !isExcludedFile(item.path));
  const selectedFiles = eligibleFiles.slice(0, 150);

  if (selectedFiles.length === 0) {
    throw new Error(`No readable code files found in repository ${owner}/${repo}.`);
  }

  const readmeFile = selectedFiles.find(f => f.path.toLowerCase() === 'readme.md' || f.path.toLowerCase().startsWith('readme'));

  // 4. Fetch lines of code in parallel batches
  const batchSize = 15;
  const fileDetails = [];

  for (let i = 0; i < selectedFiles.length; i += batchSize) {
    const batch = selectedFiles.slice(i, i + batchSize);
    const batchPromises = batch.map(async (file) => {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
      const rawContent = await fetchRawText(rawUrl);
      
      let lines = 0;
      if (rawContent) {
        lines = rawContent.split(/\r\n|\r|\n/).length;
      } else {
        lines = Math.max(1, Math.round((file.size || 100) / 35));
      }

      const { language, color, extension } = getLanguageAndColor(file.path);
      const parts = file.path.split('/');
      const topFolder = parts.length > 1 ? `${parts[0]}/` : 'root';

      return {
        path: file.path,
        name: file.path.split('/').pop(),
        folder: topFolder,
        size_bytes: file.size || 0,
        lines_of_code: lines,
        language,
        color,
        extension: extension || '',
        raw_content_sample: rawContent ? rawContent.substring(0, 4000) : ''
      };
    });

    const results = await Promise.all(batchPromises);
    fileDetails.push(...results);
  }

  // 5. Fetch Pull Requests (PR Ships)
  const prShips = await fetchPullRequests(owner, repo);

  // 6. Group files by top-level Folder Neighborhood Districts
  const totalFiles = fileDetails.length;
  const totalLines = fileDetails.reduce((sum, f) => sum + f.lines_of_code, 0);
  const maxLines = Math.max(...fileDetails.map(f => f.lines_of_code), 1);

  const folderGroups = {};
  fileDetails.forEach((file) => {
    if (!folderGroups[file.folder]) {
      folderGroups[file.folder] = [];
    }
    folderGroups[file.folder].push(file);
  });

  const folderNames = Object.keys(folderGroups);
  const districtCount = folderNames.length;

  const districtSpacing = 24;
  const folderDistricts = [];
  const buildings = [];

  folderNames.forEach((folderName, districtIdx) => {
    const filesInFolder = folderGroups[folderName];
    
    let districtCenterX = 0;
    let districtCenterZ = 0;

    if (districtCount === 1) {
      districtCenterX = 18;
      districtCenterZ = 0;
    } else {
      const angle = (districtIdx / districtCount) * Math.PI * 2;
      districtCenterX = Math.cos(angle) * (districtSpacing + Math.floor(filesInFolder.length / 4));
      districtCenterZ = Math.sin(angle) * (districtSpacing + Math.floor(filesInFolder.length / 4));
    }

    const cols = Math.ceil(Math.sqrt(filesInFolder.length));
    const spacing = 3.5;
    const blockOffsetX = (cols - 1) * spacing * 0.5;

    filesInFolder.forEach((file, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const x = districtCenterX + (col * spacing - blockOffsetX);
      const z = districtCenterZ + (row * spacing - blockOffsetX);

      const normalizedRatio = Math.pow(file.lines_of_code / maxLines, 0.65);
      const height = Math.max(1.5, Math.min(40, normalizedRatio * 38.5 + 1.5));

      buildings.push({
        id: buildings.length + 1,
        path: file.path,
        name: file.name,
        folder: file.folder,
        lines_of_code: file.lines_of_code,
        size_bytes: file.size_bytes,
        language: file.language,
        color: file.color,
        position: [parseFloat(x.toFixed(2)), parseFloat((height / 2).toFixed(2)), parseFloat(z.toFixed(2))],
        dimensions: [2.2, parseFloat(height.toFixed(2)), 2.2],
        height: parseFloat(height.toFixed(2)),
        file_content_sample: file.raw_content_sample
      });
    });

    folderDistricts.push({
      id: districtIdx + 1,
      folderName,
      fileCount: filesInFolder.length,
      center: [parseFloat(districtCenterX.toFixed(2)), 0, parseFloat(districtCenterZ.toFixed(2))]
    });
  });

  const readmeData = readmeFile
    ? fileDetails.find(f => f.path === readmeFile.path)
    : null;

  const readmeBuilding = {
    id: 9999,
    path: readmeData ? readmeData.path : 'README.md',
    name: 'Center Fountain (README)',
    isReadmeFountain: true,
    lines_of_code: readmeData ? readmeData.lines_of_code : 50,
    size_bytes: readmeData ? readmeData.size_bytes : 1500,
    language: 'Markdown Overview',
    color: '#00f0ff',
    position: [0, 2.5, 0],
    dimensions: [4.5, 5, 4.5],
    height: 5,
    file_content_sample: readmeData ? readmeData.raw_content_sample : `# ${owner}/${repo}\nRepository Overview & Architecture Fountain.`
  };

  const layoutJson = {
    owner,
    repo,
    default_branch: defaultBranch,
    total_files: totalFiles,
    total_lines: totalLines,
    folder_districts: folderDistricts,
    readme_fountain: readmeBuilding,
    pr_ships: prShips,
    buildings
  };

  return {
    owner,
    repo,
    totalFiles,
    totalLines,
    layoutJson
  };
}

module.exports = {
  parseRepoUrl,
  processRepository,
  fetchPullRequests
};
