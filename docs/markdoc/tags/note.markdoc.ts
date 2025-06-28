import { Callout } from '../../components'; // Assuming Callout.tsx is in docs/components/

export const note = {
  render: Callout,
  children: ['paragraph', 'tag', 'list'], // Same as the original callout tag
  attributes: {
    title: {
      type: String,
      default: 'Note', // Default title for notes
    },
    // Implicitly, we expect Callout to handle a 'type' prop we'll pass from its own props
  },
  // We need a way to pass the 'type' prop to the Callout component.
  // Markdoc tags can have a 'transform' function, but that's more for AST manipulation.
  // A simpler way is to have the 'render' component (Callout) receive fixed props.
  // Or, the tag itself can be a thin wrapper component that then renders Callout with the fixed prop.
  // Let's make the tag definition pass fixed props to the component.
  // This requires the 'render' attribute to be a string name of a registered component,
  // and then in the global Markdoc config, we map this string name to the actual component
  // and can inject props.
  //
  // A more direct way for this structure:
  // The `render: Callout` directly maps to the Callout component.
  // The attributes defined here (`title`) are passed as props.
  // To pass a fixed `type` prop, we can make this tag definition return a `Tag` instance
  // in a `transform` function, or the `Callout` component itself needs to be aware of which tag rendered it,
  // which is not clean.
  //
  // The most straightforward way: the component used in `render` gets all attributes from the tag.
  // If we want to fix a prop like `type` based on the tag name, we need a wrapper.
  //
  // Let's try this: each tag will be a small functional component that renders Callout.
  // No, Markdoc's `render` usually points to the component class/function itself.
  //
  // The `config` object passed to `Markdoc.transform()` can specify components.
  // `render: 'NoteCallout'` and then in config: `components: { NoteCallout: (props) => <Callout type="note" {...props} /> }`
  // This is a common pattern.
  // So, the tag definition specifies a named component.
  // And `Callout.tsx` will be enhanced to accept `type` and `title`.

  // For now, let's assume `Callout.tsx` will be modified to accept `type` and `title`
  // and we'll handle the type prop directly.
  // The tag definition itself can pass default attributes.
  // The 'type' is not a standard Markdoc attribute that can be defaulted here in the same way as 'title'.
  //
  // The simplest approach is to have 4 distinct render components, or one render component that gets a type.
  // The `Callout` component will be used. The key is how `type="note"` is passed.
  // It will be passed as a direct prop from the component that Markdoc resolves for this tag.
  //
  // Let's define the tag to render a specifically named component, e.g., 'NoteCallout'.
  // This name will be resolved to `<Callout type="note" {...props} />` in the main Markdoc config.
  // This means `Callout.tsx` itself doesn't need to change its props for this, the config handles it.
  // However, the plan states "Modify Callout.tsx to accept a type prop". This is simpler.
  // If Callout.tsx accepts a type prop, then we need to ensure this tag passes it.
  // Markdoc doesn't directly allow fixing props like `type="note"` in the tag definition if `render` points to a shared component.
  //
  // Solution: The tag's `transform` function can add/override attributes.
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    // Add or override the 'type' attribute for the Callout component
    const finalAttributes = { ...attributes, type: 'note' };
    if (!attributes.title) { // Set default title if not provided by user
        finalAttributes.title = 'Note';
    }
    return new config.Tag(Callout, finalAttributes, children);
  }
};
