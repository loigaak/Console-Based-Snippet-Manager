#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');
const clipboardy = require('clipboardy');

const SNIPPET_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.snippets.json');

// Load snippets
async function loadSnippets() {
  try {
    const data = await fs.readFile(SNIPPET_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save snippets
async function saveSnippets(snippets) {
  await fs.writeFile(SNIPPET_FILE, JSON.stringify(snippets, null, 2));
}

// Add a new snippet
async function addSnippet(title, code, tags) {
  const snippets = await loadSnippets();
  const id = snippets.length + 1;
  snippets.push({ id, title, code, tags: tags ? tags.split(',') : [], created: new Date().toISOString() });
  await saveSnippets(snippets);
  console.log(chalk.green(`Snippet "${title}" added with ID: ${id}`));
}

// List snippets
async function listSnippets(tag) {
  const snippets = await loadSnippets();
  let filtered = snippets;
  if (tag) {
    filtered = snippets.filter(snippet => snippet.tags.includes(tag));
  }
  if (!filtered.length) {
    console.log(chalk.yellow('No snippets found.'));
    return;
  }
  console.log(chalk.blue('Snippets:'));
  filtered.forEach(snippet => {
    console.log(chalk.cyan(`ID: ${snippet.id} | Title: ${snippet.title}`));
    console.log(`Code: ${chalk.gray(snippet.code)}`);
    console.log(`Tags: ${snippet.tags.join(', ') || 'None'} | Created: ${snippet.created}`);
    console.log('---');
  });
}

// Search snippets
async function searchSnippets(query) {
  const snippets = await loadSnippets();
  const filtered = snippets.filter(
    snippet =>
      snippet.title.toLowerCase().includes(query.toLowerCase()) ||
      snippet.code.toLowerCase().includes(query.toLowerCase())
  );
  if (!filtered.length) {
    console.log(chalk.yellow('No snippets found.'));
    return;
  }
  console.log(chalk.blue('Search Results:'));
  filtered.forEach(snippet => {
    console.log(chalk.cyan(`ID: ${snippet.id} | Title: ${snippet.title}`));
    console.log(`Code: ${chalk.gray(snippet.code)}`);
    console.log(`Tags: ${snippet.tags.join(', ') || 'None'} | Created: ${snippet.created}`);
    console.log('---');
  });
}

// Copy snippet to clipboard
async function copySnippet(id) {
  const snippets = await loadSnippets();
  const snippet = snippets.find(s => s.id === parseInt(id));
  if (!snippet) {
    console.log(chalk.red(`Snippet with ID ${id} not found.`));
    return;
  }
  await clipboardy.write(snippet.code);
  console.log(chalk.green(`Snippet "${snippet.title}" copied to clipboard!`));
}

// Delete snippet
async function deleteSnippet(id) {
  const snippets = await loadSnippets();
  const index = snippets.findIndex(s => s.id === parseInt(id));
  if (index === -1) {
    console.log(chalk.red(`Snippet with ID ${id} not found.`));
    return;
  }
  const [snippet] = snippets.splice(index, 1);
  await saveSnippets(snippets);
  console.log(chalk.green(`Snippet "${snippet.title}" deleted.`));
}

program
  .command('add')
  .description('Add a new snippet')
  .option('--title <title>', 'Snippet title')
  .option('--code <code>', 'Snippet code')
  .option('--tags <tags>', 'Comma-separated tags (e.g., javascript,react)')
  .action(async (options) => {
    if (!options.title || !options.code) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Enter snippet title:',
          when: () => !options.title,
        },
        {
          type: 'input',
          name: 'code',
          message: 'Enter snippet code:',
          when: () => !options.code,
        },
        {
          type: 'input',
          name: 'tags',
          message: 'Enter tags (comma-separated, optional):',
        },
      ]);
      options.title = options.title || answers.title;
      options.code = options.code || answers.code;
      options.tags = options.tags || answers.tags;
    }
    await addSnippet(options.title, options.code, options.tags);
  });

program
  .command('list')
  .description('List all snippets or filter by tag')
  .option('--tag <tag>', 'Filter by tag')
  .action((options) => listSnippets(options.tag));

program
  .command('search <query>')
  .description('Search snippets by title or code')
  .action((query) => searchSnippets(query));

program
  .command('copy <id>')
  .description('Copy a snippet to the clipboard')
  .action((id) => copySnippet(id));

program
  .command('delete <id>')
  .description('Delete a snippet by ID')
  .action((id) => deleteSnippet(id));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan('Use the "add" command to start saving snippets!'));
}
