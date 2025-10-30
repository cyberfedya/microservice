// components/StatusDistributionChart.tsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface StatusDistributionChartProps {
  data: ChartData[];
  onSliceClick: (status: string) => void;
  activeFilter: string;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  onSliceClick,
  activeFilter,
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const activeData = data.filter((d) => d.value > 0);

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  if (activeData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-white/50">
        Statistika uchun ma'lumotlar mavjud emas.
      </div>
    );
  }

  // 🌀 Кастомный рендер процентов внутри сегмента (3D-эффект + подсветка)
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
        fill="white"
        style={{
          textShadow:
            '0 0 4px rgba(0,0,0,0.7), 0 0 8px rgba(255,255,255,0.6), 0 0 12px rgba(59,130,246,0.5)',
          filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))',
          pointerEvents: 'none',
          transform: 'translateY(1px)',
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-5 backdrop-blur-md transition-all duration-500 ease-in-out hover:shadow-[0_0_60px_rgba(34,211,238,0.3)] h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Градиенты */}
          <defs>
            <radialGradient id="grad-blue" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity={1} />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.95} />
            </radialGradient>
            <radialGradient id="grad-green" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#86efac" stopOpacity={1} />
              <stop offset="100%" stopColor="#14532d" stopOpacity={0.95} />
            </radialGradient>
            <radialGradient id="grad-red" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#fca5a5" stopOpacity={1} />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.95} />
            </radialGradient>
          </defs>

          <Pie
            data={activeData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            labelLine={false}
            label={renderCustomLabel}
            onClick={(entry) => onSliceClick(entry.name)}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            isAnimationActive={true}
            animationBegin={200}
            animationDuration={1000}
            activeIndex={activeIndex ?? -1}
            activeShape={(props) => (
              <Sector
                {...props}
                outerRadius={100}
                fillOpacity={0.98}
                stroke="#f0f9ff"
                strokeWidth={2}
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(34,211,238,0.8))',
                  transition: 'all 0.3s ease',
                }}
              />
            )}
          >
            {activeData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.name === 'Ijroda'
                    ? 'url(#grad-blue)'
                    : entry.name === 'Yakunlangan'
                    ? 'url(#grad-green)'
                    : 'url(#grad-red)'
                }
                style={{
                  cursor: 'pointer',
                  opacity:
                    activeFilter === 'Barchasi' || activeFilter === entry.name
                      ? 1
                      : 0.4,
                  transition: 'opacity 0.3s ease',
                }}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.95))',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 25px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
            }}
            itemStyle={{
              color: '#fff',
              fontSize: '0.85rem',
              textShadow: '0 0 6px rgba(0,0,0,0.6)',
            }}
          />

          <Legend
            iconType="circle"
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              color: '#f1f5f9',
              fontSize: '0.9rem',
              letterSpacing: '0.03em',
              textShadow: '0 0 8px rgba(0,0,0,0.6)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusDistributionChart;
