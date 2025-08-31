import { X } from 'lucide-react';
import { useState } from 'react';

const TagInput = ({ label, icon: Icon, tags, setTags, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();

      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        <Icon className="inline w-4 h-4 mr-2" />
        {label}
      </label>
      <div className="w-full p-2 flex flex-wrap items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-400/20 transition-all duration-300">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-md px-3 py-1 text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow bg-transparent p-2 outline-none text-slate-800 dark:text-slate-200"
        />
      </div>
    </div>
  );
};

export default TagInput;
