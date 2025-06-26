import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MarkdocFile } from '@markdoc/markdoc'; // Using this as a placeholder for content type

// Define the shape of the context data
interface AsideContentContextType {
  asideContent: ReactNode | null; // Markdoc AST Node or pre-rendered ReactNode
  setAsideContent: (content: ReactNode | null) => void; // Function to set the content
}

// Create the context with a default undefined value initially
const AsideContentContext = createContext<AsideContentContextType | undefined>(undefined);

// Create a provider component
interface AsideContentProviderProps {
  children: ReactNode;
}

export const AsideContentProvider: React.FC<AsideContentProviderProps> = ({ children }) => {
  const [asideContent, setAsideContent] = useState<ReactNode | null>(null);

  return (
    <AsideContentContext.Provider value={{ asideContent, setAsideContent }}>
      {children}
    </AsideContentContext.Provider>
  );
};

// Create a custom hook to use the aside content context
export const useAsideContent = (): AsideContentContextType => {
  const context = useContext(AsideContentContext);
  if (context === undefined) {
    throw new Error('useAsideContent must be used within an AsideContentProvider');
  }
  return context;
};
