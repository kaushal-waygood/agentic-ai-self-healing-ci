export const convertToHTMLPrompt = (student) => {
  return `
Convert the following JSON data into a complete HTML resume layout.

Requirements:
- Use HTML5
- Include internal CSS styling
- Use a white background for the entire page
- Ensure proper spacing and padding between sections
- Output clean HTML, no markdown or extra explanation
- Avoid shadow effects on the resume layout
- makes haward cv style with sleek UI

Data:
${JSON.stringify(student, null, 2)}

Output only the HTML:
`;
};
