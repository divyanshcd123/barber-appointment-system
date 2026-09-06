const StatsCard = ({ label, value, icon: Icon, trend, color = 'gold', prefix = '', suffix = '' }) => {
  const colors = {
    gold: { text: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/20', bar: 'bg-gold-gradient' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', bar: 'bg-blue-500' },
    green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', bar: 'bg-green-500' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', bar: 'bg-purple-500' },
  };
  const c = colors[color] || colors.gold;

  return (
    <div className="stat-card animate-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold ${c.text}`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
            <Icon size={22} className={c.text} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-2">
          <span className={trend >= 0 ? 'text-green-400 text-xs font-medium' : 'text-red-400 text-xs font-medium'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 text-xs">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
