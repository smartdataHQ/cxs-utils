import React, { useEffect, ReactNode } from 'react';
import { useAsideContent } from './context/AsideContentContext';

interface CodePaneInjectorProps {
  children: ReactNode;
}

const CodePaneInjector: React.FC<CodePaneInjectorProps> = ({ children }) => {
  const { setAsideContent } = useAsideContent();

  useEffect(() => {
    // Set the content for the aside pane when this component mounts
    setAsideContent(children);

    // Clear the content when this component unmounts (e.g., if the page structure changes dynamically)
    // This is also handled globally on route change in _app.tsx, but this provides an extra layer.
    return () => {
      setAsideContent(null);
    };
  }, [children, setAsideContent]);

  return null; // This component does not render anything itself in the main flow
};

export default CodePaneInjector;
