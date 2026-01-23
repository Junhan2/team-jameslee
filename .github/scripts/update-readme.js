#!/usr/bin/env node

// README Auto-Update Script
//
// Automatically updates the README.md plugin section based on:
// - .claude-plugin/marketplace.json (plugin order)
// - plugins/[name]/.claude-plugin/plugin.json (metadata)
// - plugins/[name]/commands/[cmd].md (command frontmatter)
// - plugins/[name]/agents/[agent].md (agent frontmatter)

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const README_PATH = path.join(ROOT_DIR, 'README.md');
const MARKETPLACE_PATH = path.join(ROOT_DIR, '.claude-plugin/marketplace.json');

const START_MARKER = '<!-- PLUGINS_START -->';
const END_MARKER = '<!-- PLUGINS_END -->';

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { body: content };

  const frontmatter = { body: content.substring(match[0].length).trim() };
  const lines = match[1].split('\n');
  let currentKey = null;
  let multilineValue = '';
  let inMultiline = false;

  for (const line of lines) {
    if (inMultiline) {
      if (line.match(/^\s{2}/) || line.trim() === '') {
        multilineValue += line.replace(/^\s{2}/, '') + '\n';
        continue;
      } else {
        frontmatter[currentKey] = multilineValue.trim();
        inMultiline = false;
      }
    }

    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      if (value === '|' || value === '>') {
        currentKey = key;
        multilineValue = '';
        inMultiline = true;
      } else {
        frontmatter[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  if (inMultiline && currentKey) {
    frontmatter[currentKey] = multilineValue.trim();
  }

  return frontmatter;
}

/**
 * Extract description from markdown body (fallback)
 */
function extractDescriptionFromBody(body) {
  if (!body) return null;

  // Try to find first paragraph after heading
  const lines = body.split('\n');
  let foundHeading = false;

  for (const line of lines) {
    if (line.startsWith('#')) {
      foundHeading = true;
      continue;
    }
    if (foundHeading && line.trim() && !line.startsWith('#') && !line.startsWith('```')) {
      // Clean up the line
      return line.trim().replace(/[`*_]/g, '').substring(0, 100);
    }
  }

  return null;
}

/**
 * Get all markdown files in a directory
 */
function getMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dir, f));
}

/**
 * Extract commands from plugin
 */
function getCommands(pluginPath) {
  const commandsDir = path.join(pluginPath, 'commands');
  const files = getMarkdownFiles(commandsDir);

  return files.map(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const name = path.basename(file, '.md');

    // Try to get description from various sources
    let description = frontmatter.description ||
                     frontmatter.name ||
                     extractDescriptionFromBody(frontmatter.body) ||
                     name;

    // Clean up description
    description = description.split('\n')[0].trim();

    return {
      name: `/${name}`,
      description: description
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract agents from plugin
 */
function getAgents(pluginPath) {
  const agentsDir = path.join(pluginPath, 'agents');
  const files = getMarkdownFiles(agentsDir);

  return files.map(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const fileName = path.basename(file, '.md');

    // Extract first sentence of description for brevity
    let description = frontmatter.description || '';
    const firstSentence = description.split(/[.\n]/)[0];

    return {
      name: frontmatter.name || fileName,
      description: firstSentence.replace(/^Use this agent (when|to)\s*/i, '').trim()
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Read plugin metadata
 */
function getPluginMetadata(pluginPath) {
  const pluginJsonPath = path.join(pluginPath, '.claude-plugin/plugin.json');
  if (!fs.existsSync(pluginJsonPath)) return null;

  const content = fs.readFileSync(pluginJsonPath, 'utf-8');
  return JSON.parse(content);
}

// Words that should be all uppercase
const UPPERCASE_WORDS = ['ui', 'api', 'pr', 'cli', 'css', 'html', 'js', 'ts', 'rsc'];

/**
 * Generate markdown for a single plugin
 */
function generatePluginSection(plugin, index) {
  const pluginPath = path.join(ROOT_DIR, 'plugins', plugin.name);
  const metadata = getPluginMetadata(pluginPath);
  const commands = getCommands(pluginPath);
  const agents = getAgents(pluginPath);

  // Format plugin name for display
  const displayName = plugin.name
    .split('-')
    .map(word => {
      if (UPPERCASE_WORDS.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  let section = `### ${index + 1}. ${displayName}\n\n`;

  // Description from marketplace
  if (plugin.description) {
    section += `${plugin.description}\n\n`;
  }

  // Commands table
  if (commands.length > 0) {
    section += '**Commands:**\n';
    section += '| Command | Description |\n';
    section += '|---------|-------------|\n';
    for (const cmd of commands) {
      section += `| \`${cmd.name}\` | ${cmd.description} |\n`;
    }
    section += '\n';
  }

  // Agents list
  if (agents.length > 0) {
    section += '**Agents:**\n';
    for (const agent of agents) {
      section += `- \`${agent.name}\` - ${agent.description}\n`;
    }
    section += '\n';
  }

  section += '---\n';

  return section;
}

/**
 * Main function
 */
function main() {
  console.log('Reading marketplace.json...');

  if (!fs.existsSync(MARKETPLACE_PATH)) {
    console.error('Error: marketplace.json not found');
    process.exit(1);
  }

  const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_PATH, 'utf-8'));
  const plugins = marketplace.plugins || [];

  console.log(`Found ${plugins.length} plugins`);

  // Generate plugin sections
  let pluginsContent = '<!-- AUTO-GENERATED: DO NOT EDIT MANUALLY -->\n\n';

  for (let i = 0; i < plugins.length; i++) {
    console.log(`Processing: ${plugins[i].name}`);
    pluginsContent += generatePluginSection(plugins[i], i);
    pluginsContent += '\n';
  }

  // Read current README
  console.log('Reading README.md...');
  let readme = fs.readFileSync(README_PATH, 'utf-8');

  // Find markers
  const startIndex = readme.indexOf(START_MARKER);
  const endIndex = readme.indexOf(END_MARKER);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Error: Markers not found in README.md');
    console.error('Please add these markers:');
    console.error('  <!-- PLUGINS_START -->');
    console.error('  <!-- PLUGINS_END -->');
    process.exit(1);
  }

  // Replace content between markers
  const before = readme.substring(0, startIndex + START_MARKER.length);
  const after = readme.substring(endIndex);

  const newReadme = before + '\n' + pluginsContent + after;

  // Write updated README
  fs.writeFileSync(README_PATH, newReadme);
  console.log('README.md updated successfully!');
}

main();
