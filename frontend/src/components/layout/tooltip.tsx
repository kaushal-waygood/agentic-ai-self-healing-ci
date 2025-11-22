'use client';

export const Tooltip = ({ label, children }) => {
  return (
    <div className="relative group inline-block">
      {children}

      {/* Tooltip Box BELOW */}
      <div
        className=" border
          absolute top-full mt-4 left-1/2 -translate-x-1/2
          bg-gray-300 text-black text-xs font-medium px-2 py-1 rounded-md
          whitespace-nowrap pointer-events-none
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          z-50
        "
      >
        {label}

        {/* Arrow (pointing UP now) */}
        <div
          className="
            absolute left-1/2 -top-1 -translate-x-1/2
            w-2 h-2 bg-gray-300 rotate-45
          "
        ></div>
      </div>
    </div>
  );
};
