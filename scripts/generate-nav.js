const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsRootPath = path.join(process.cwd(), 'docs', 'pages', 'docs');
const outputNavFile = path.join(process.cwd(), 'docs', 'components', 'sidenav-data.json');

// Function to convert filename to title case if no title in frontmatter
function toTitleCase(str) {
  return str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function getNavigationData(currentDirPath, relativePathFromDocsPages) {
  const items = [];
  const entries = fs.readdirSync(currentDirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullEntryPath = path.join(currentDirPath, entry.name);
    // Construct path relative to 'docs/pages/docs' for URL generation
    const pathSegment = entry.name.replace(/\.md(oc)?$/, '');
    const newRelativePathFromDocsPages = path.join(relativePathFromDocsPages, pathSegment);

    let title = toTitleCase(pathSegment);
    let order = Infinity; // Default order, items without nav_order go last
    let hidden = false;

    if (entry.isDirectory()) {
      // Skip specific problematic directories
      if (newRelativePathFromDocsPages === 'semantic-events/bible/example-events') {
        console.log(`Skipping directory: ${newRelativePathFromDocsPages}`);
        continue;
      }

      const indexFileMd = path.join(fullEntryPath, 'index.md');
      const indexFileMdoc = path.join(fullEntryPath, 'index.mdoc');
      let children = [];

      if (fs.existsSync(indexFileMd) || fs.existsSync(indexFileMdoc)) {
        const indexFilePath = fs.existsSync(indexFileMd) ? indexFileMd : indexFileMdoc;
        const fileContent = fs.readFileSync(indexFilePath, 'utf8');
        const { data } = matter(fileContent);
        if (data.title) title = data.title;
        if (data.nav_order !== undefined) order = parseInt(data.nav_order, 10);
        if (data.nav_skip === true || data.hidden === true) hidden = true;
      }

      if (hidden) continue;

      children = getNavigationData(fullEntryPath, newRelativePathFromDocsPages);

      // Determine the correct path for the directory link
      // It should link to the directory itself, which Next.js handles as /docs/segment or /docs/segment/
      const dirPathForLink = `/docs${newRelativePathFromDocsPages.replace(/\\/g, '/')}`;


      // Only add if it has children or an index page (signifying it's a section)
      if (children.length > 0 || fs.existsSync(indexFileMd) || fs.existsSync(indexFileMdoc)) {
        items.push({
          title: title,
          path: dirPathForLink.replace(/\/index$/, ''), // Clean up /index from path
          order: order,
          children: children,
        });
      }
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdoc'))) {
      // Skip index files here; they define their parent directory's properties
      if (entry.name === 'index.md' || entry.name === 'index.mdoc') {
        continue;
      }

      const fileContent = fs.readFileSync(fullEntryPath, 'utf8');
      const { data } = matter(fileContent);

      if (data.nav_skip === true || data.hidden === true) continue;

      items.push({
        title: data.title || toTitleCase(pathSegment),
        path: `/docs${newRelativePathFromDocsPages.replace(/\\/g, '/')}`,
        order: data.nav_order !== undefined ? parseInt(data.nav_order, 10) : Infinity,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.title.localeCompare(b.title);
  });
}

try {
  // Start scanning from 'docs/pages/docs', so initial relative path is '/'
  const navigationTree = getNavigationData(docsRootPath, '/');

  // The root index.md for /docs itself
  const rootIndexMdPath = path.join(docsRootPath, 'index.md');
  const rootIndexMdocPath = path.join(docsRootPath, 'index.mdoc');
  let rootDocsEntry = null;

  if (fs.existsSync(rootIndexMdPath) || fs.existsSync(rootIndexMdocPath)) {
    const rootIndexFile = fs.existsSync(rootIndexMdPath) ? rootIndexMdPath : rootIndexMdocPath;
    const fileContent = fs.readFileSync(rootIndexFile, 'utf8');
    const { data } = matter(fileContent);
    rootDocsEntry = {
      title: data.title || 'Overview', // Default title for the main docs page
      path: '/docs',
      order: data.nav_order !== undefined ? parseInt(data.nav_order, 10) : -1, // Ensure it's usually first
                                                                               // Or use a specific low number like -1 or 0
      // children: navigationTree, // Option 1: make top-level items children of "Overview"
    };
  }

  let finalOutput = navigationTree;
  // Option 2: Add "Overview" as a peer if it exists, and sort it in.
  // This feels more natural for the kind of SideNav this project has.
  if (rootDocsEntry) {
     finalOutput.push(rootDocsEntry);
     finalOutput.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.title.localeCompare(b.title);
     });
  }


  fs.writeFileSync(outputNavFile, JSON.stringify(finalOutput, null, 2));
  console.log(`Navigation data generated successfully at ${outputNavFile}`);
} catch (error) {
  console.error("Error generating navigation data:", error);
}
