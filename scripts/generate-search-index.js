const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // Already installed
const Markdoc = require('@markdoc/markdoc'); // Already a dependency for the project
const FlexSearch = require('flexsearch');

const docsPagesPath = path.join(process.cwd(), 'docs', 'pages', 'docs');
const outputIndexPath = path.join(process.cwd(), 'docs', 'public', 'search-index.json');

// Function to recursively get all Markdoc files
function getAllMarkdocFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllMarkdocFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.md') || file.endsWith('.mdoc')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

// Function to extract text from Markdoc AST
// This needs to be tailored to extract meaningful text.
// For simplicity, it will grab text from common nodes.
function extractTextFromNode(node) {
  let text = '';
  if (node.type === 'text') {
    text += node.attributes.content + ' ';
  }
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      text += extractTextFromNode(child);
    }
  }
  // Could add more sophisticated handling here, e.g., for list items, table content, etc.
  // Also, might want to give lower weight or ignore code block content if it pollutes search results.
  return text;
}


async function generateSearchIndex() {
  console.log('Starting search index generation...');
  const files = getAllMarkdocFiles(docsPagesPath);

  // Configure FlexSearch Document Index
  // Using 'performance' profile, and a simple tokenizer.
  // See FlexSearch docs for more options: https://github.com/nextapps-de/flexsearch
  const index = new FlexSearch.Document({
    document: {
      id: 'id', // Path will be unique ID
      index: ['title', 'description', 'content'], // Fields to index
      store: ['title', 'path', 'descriptionSnippet'] // Fields to store and return in search results
    },
    tokenize: 'forward', // Simple tokenizer, 'strict' or 'reverse' are other options
    resolution: 9, // Default resolution
    profile: 'default', // 'memory', 'match', 'score', 'balance', 'fast'
  });

  let docIdCounter = 0;

  for (const filePath of files) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(fileContent);

      if (frontmatter.nav_skip === true || frontmatter.hidden === true || frontmatter.search_skip === true) {
        console.log(`Skipping ${filePath} due to frontmatter skip flag.`);
        continue;
      }

      const ast = Markdoc.parse(markdownContent);
      // We don't need to fully transform, just parse to get the AST for text extraction.
      // However, if custom tags render significant textual content NOT directly in their children,
      // a full transform might be needed, which is more complex for a script.
      // For now, parsing and extracting from standard nodes.

      const extractedContent = extractTextFromNode(ast).replace(/\s+/g, ' ').trim();

      // Create a path relative to the /docs/ directory for URLs
      const relativePath = '/' + path.relative(path.join(process.cwd(), 'docs', 'pages'), filePath)
        .replace(/\\/g, '/')
        .replace(/\.md(oc)?$/, '')
        .replace(/\/index$/, ''); // /docs/section/index -> /docs/section

      const doc = {
        id: docIdCounter++, // FlexSearch needs a unique ID per document
        path: relativePath,
        title: frontmatter.title || path.basename(filePath, path.extname(filePath)),
        descriptionSnippet: frontmatter.description || extractedContent.substring(0, 150) + (extractedContent.length > 150 ? '...' : ''), // Store a snippet
        content: extractedContent,
      };

      index.add(doc);
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  // Export the index. FlexSearch allows exporting each part of the index.
  // We'll store these parts in an object.
  const exportedIndex = {};
  index.export((key, data) => {
    exportedIndex[key] = data;
  });

  fs.writeFileSync(outputIndexPath, JSON.stringify(exportedIndex));
  console.log(`Search index generated successfully with ${docIdCounter} documents at ${outputIndexPath}`);
}

generateSearchIndex().catch(console.error);
