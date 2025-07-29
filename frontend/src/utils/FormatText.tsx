// components/utils/FormattedDescription.tsx

import React from 'react';

interface FormattedDescriptionProps {
  text: string;
}

export const FormattedText = ({ text }: FormattedDescriptionProps) => {
  if (!text) return null;

  // Split text into individual lines
  const lines = text.split('\n').filter(Boolean); // Filter out empty lines

  const contentBlocks = [];
  let currentListItems = [];

  // Group lines into headings or lists of bullet points
  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('•')) {
      // If it's a list item, add it to the current list
      // Remove the bullet character '•' and trim whitespace
      currentListItems.push(trimmedLine.substring(1).trim());
    } else {
      // If it's not a list item, it's a new heading.
      // First, if we have a list of items, push it to our main blocks array.
      if (currentListItems.length > 0) {
        contentBlocks.push({ type: 'list', items: currentListItems });
        currentListItems = []; // Reset for the next list
      }
      // Then, add the new heading.
      contentBlocks.push({ type: 'heading', content: trimmedLine });
    }
  }

  // After the loop, add any remaining list items
  if (currentListItems.length > 0) {
    contentBlocks.push({ type: 'list', items: currentListItems });
  }

  return (
    // The `prose` classes handle the beautiful typography for us
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {contentBlocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            // prose `h4` will be bold by default
            <h4 key={index}>{block.content}</h4>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                // Add margin-bottom to each list item for more line height
                <li key={itemIndex} className="mb-2">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
};
