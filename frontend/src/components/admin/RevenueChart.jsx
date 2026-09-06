import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 border border-gold-500/20 text-sm">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-gold-500 font-semibold">
            {entry.name === 'revenue' ? '₹' : ''}{entry.value?.toLocaleString()}
            {entry.name === 'count' ? ' appts' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ monthlyRevenue = [], type = 'area' }) => {
  const data = monthlyRevenue.map((d) => ({
    month: MONTHS[(d._id.month || 1) - 1],
    revenue: d.revenue || 0,
    count: d.count || 0,
  }));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Revenue Overview</h3>
          <p className="text-gray-400 text-sm">Last 6 months</p>
        </div>
        <div className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-lg">Monthly</div>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500">
          No revenue data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="url(#goldGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
              </defs>
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldArea)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
