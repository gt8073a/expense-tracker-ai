interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  colorClass: string; // e.g. 'indigo', 'blue', 'green', 'gray'
  icon: React.ReactNode;
}

const colorMap: Record<
  string,
  { bg: string; iconBg: string; iconColor: string; value: string }
> = {
  indigo: {
    bg: 'bg-white',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    value: 'text-indigo-700',
  },
  blue: {
    bg: 'bg-white',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    value: 'text-blue-700',
  },
  green: {
    bg: 'bg-white',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    value: 'text-green-700',
  },
  gray: {
    bg: 'bg-white',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    value: 'text-gray-700',
  },
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  colorClass,
  icon,
}: SummaryCardProps) {
  const colors = colorMap[colorClass] ?? colorMap['indigo'];

  return (
    <div
      className={`${colors.bg} rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4`}
    >
      <div
        className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${colors.iconBg}`}
      >
        <span className={colors.iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${colors.value} truncate`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
