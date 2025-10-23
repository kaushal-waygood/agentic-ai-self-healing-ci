const AvailabilityStep = ({ selectedOptions, toggleOption }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[
        'Immediately',
        'Within 2 weeks',
        'Within 1 month',
        '1-3 months',
        '3+ months',
      ].map((avail) => (
        <button
          key={avail}
          onClick={() => toggleOption('availability', avail)}
          className={`p-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
            selectedOptions.availability === avail
              ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300'
          }`}
        >
          <span className="text-md font-semibold">{avail}</span>
        </button>
      ))}
    </div>
  );
};

export default AvailabilityStep;
