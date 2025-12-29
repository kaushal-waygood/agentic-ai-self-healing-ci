'use client';

interface HowToClaimData {
  title: string;
  steps: string[];
}

interface HowToClaimModalProps {
  open: boolean;
  data: HowToClaimData | null;
  onClose: () => void;
}

export function HowToClaimModal({ open, data, onClose }: HowToClaimModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-2 md:p-0">
      <div className="bg-white rounded-2xl shadow-lg  border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-300 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {data?.title || 'How to Claim'}
        </h2>

        <div className="space-y-4">
          {data?.steps?.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2.5 rounded-lg bg-buttonPrimary text-white font-semibold shadow-md hover:shadow-xl active:scale-95 transition-all"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
