import CodePaneInjector from '../../components/CodePaneInjector'; // Adjust path as needed

export const codepane = {
  render: CodePaneInjector,
  children: ['tabs', 'fence', 'tag'], // Specify what kind of content can go inside {% code_pane %}
                                     // 'tabs' for tabbed code blocks, 'fence' for single code blocks.
                                     // 'tag' allows other Markdoc tags if needed, though typically it will be code.
  attributes: {}, // No specific attributes for the pane itself for now
};
