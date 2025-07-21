export const capitalise = (str: string, lowerRest = false) => {
  if (typeof str !== 'string' || !str) return str;

  return str
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      const firstChar = word[0].toUpperCase();
      const restChars = lowerRest ? word.slice(1).toLowerCase() : word.slice(1);
      return firstChar + restChars;
    })
    .join(' ');
};
