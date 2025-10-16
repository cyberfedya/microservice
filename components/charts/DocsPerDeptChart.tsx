import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Correspondence } from '../../types';

interface DocsPerDeptChartProps {
    data: Correspondence[];
    onBarClick: (departmentName: string) => void;
    activeFilter: string;
}

const DocsPerDeptChart: React.FC<DocsPerDeptChartProps> = ({ data, onBarClick, activeFilter }) => {
    const deptCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        
        data.forEach(doc => {
            // Use the main executor's department name, or a default if not assigned
            const deptName = doc.mainExecutor?.department?.name || 'Tayinlanmagan';
            counts[deptName] = (counts[deptName] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, documents]) => ({ name, documents }))
            .sort((a, b) => b.documents - a.documents); // Sort for better visualization

    }, [data]);

    if (deptCounts.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-sm text-white/50">
                Departamentlar bo'yicha ma'lumotlar mavjud emas.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={deptCounts}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                layout="vertical"
                onClick={(payload) => {
                    if (payload && payload.activePayload && payload.activePayload.length > 0) {
                        onBarClick(payload.activePayload[0].payload.name);
                    }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis type="number" allowDecimals={false} stroke="#a0aec0" />
                <YAxis dataKey="name" type="category" width={120} stroke="#a0aec0" tick={{ fontSize: 12 }} />
                <Tooltip 
                    cursor={{ fill: 'rgba(13, 148, 136, 0.2)' }}
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(255, 255, 255, 0.2)' }} 
                />
                <Bar dataKey="documents" name="Hujjatlar soni" barSize={20}>
                    {deptCounts.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={activeFilter === 'Barchasi' || activeFilter === entry.name ? '#0d9488' : '#042f2e'}
                            style={{ cursor: 'pointer', transition: 'fill 0.2s' }} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DocsPerDeptChart;