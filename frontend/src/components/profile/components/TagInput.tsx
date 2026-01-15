// import { X } from 'lucide-react';
// import { useState } from 'react';

// const TagInput = ({ label, icon: Icon, tags, setTags, placeholder }) => {
//   const [inputValue, setInputValue] = useState('');

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault();
//       const newTag = inputValue.trim();

//       if (newTag && !tags.includes(newTag)) {
//         setTags([...tags, newTag]);
//       }
//       setInputValue('');
//     }
//   };

//   const removeTag = (indexToRemove) => {
//     setTags(tags.filter((_, index) => index !== indexToRemove));
//   };

//   return (
//     <div className="group">
//       <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
//         <Icon className="inline w-4 h-4 mr-2" />
//         {label}
//       </label>
//       <div className="w-full p-2 flex flex-wrap items-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:border-blue-400 transition-all duration-300">
//         {tags?.map((tag, index) => (
//           <div
//             key={index}
//             className="flex items-center gap-2 bg-blue-100 dark:bg-purple-900/50 text-blue-700 dark:text-purple-300 rounded-md px-3 py-1 text-sm font-medium"
//           >
//             {tag}
//             <button
//               type="button"
//               onClick={() => removeTag(index)}
//               className="text-blue-500 hover:text-purple-700 dark:hover:text-purple-200"
//             >
//               <X size={14} />
//             </button>
//           </div>
//         ))}
//         <input
//           type="text"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder={placeholder}
//           className="flex-grow bg-transparent p-2 outline-none text-slate-800 dark:text-slate-200"
//         />
//       </div>
//     </div>
//   );
// };

// export default TagInput;
import { X, Plus } from 'lucide-react'; // 1. Import Plus icon
import { useState } from 'react';

const TagInput = ({ label, icon: Icon, tags = [], setTags, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  // 2. Extracted logic to add a tag so it can be reused
  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
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

      <div className="w-full p-2 flex flex-wrap items-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:border-blue-400 transition-all duration-300">
        {/* Render Tags */}
        {tags?.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-blue-100 dark:bg-purple-900/50 text-blue-700 dark:text-purple-300 rounded-md px-3 py-1 text-sm font-medium animate-in fade-in zoom-in duration-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-blue-500 hover:text-purple-700 dark:hover:text-purple-200"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Input and Add Button Container */}
        <div className="flex-grow flex items-center min-w-[150px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-grow bg-transparent p-2 outline-none text-slate-800 dark:text-slate-200 min-w-[100px]"
          />

          {/* 3. New Add Button */}
          <button
            type="button"
            onClick={addTag}
            disabled={!inputValue.trim()} // Disable if input is empty
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            title="Add tag"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagInput;
