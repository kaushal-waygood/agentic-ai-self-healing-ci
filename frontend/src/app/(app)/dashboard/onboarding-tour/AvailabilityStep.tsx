const AvailabilityStep = ({ selectedOptions, toggleOption }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
            selectedOptions.availability === avail
              ? 'border-blue-500'
              : 'border-gray-200 bg-white/50 hover:border-blue-300'
          }`}
        >
          <span className="text-md font-semibold">{avail}</span>
        </button>
      ))}
    </div>
  );
};

export default AvailabilityStep;
