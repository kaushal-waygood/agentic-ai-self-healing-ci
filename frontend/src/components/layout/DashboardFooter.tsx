import React from 'react';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 py-3 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xs text-gray-500 font-medium">
          © {currentYear} ZobsAI
        </div>

        <nav className="flex items-center gap-4">
          <a
            href="#"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default DashboardFooter;
