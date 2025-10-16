import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface StatusDistributionChartProps {
    data: ChartData[];
    onSliceClick: (status: string) => void;
    activeFilter: string;
}

const COLORS: { [key: string]: string } = {
    'Ijroda': '#3b82f6', // blue-500
    'Yakunlangan': '#22c55e', // green-500
    "Muddati o'tgan": '#ef4444', // red-500
};

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data, onSliceClick, activeFilter }) => {
    const activeData = data.filter(d => d.value > 0);

    if (activeData.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-sm text-white/50">
                Statistika uchun ma'lumotlar mavjud emas.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={150}>
            <PieChart>
                <Pie
                    onClick={(data) => onSliceClick(data.name)}
                    data={activeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    labelLine={false}
                >
                    {activeData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.name]} 
                            style={{ opacity: activeFilter === 'Barchasi' || activeFilter === entry.name ? 1 : 0.4, cursor: 'pointer', transition: 'opacity 0.2s' }}
                        />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default StatusDistributionChart;