export const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <div
    className={`p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
      isActive
        ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-lg scale-105'
        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:scale-102'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);
