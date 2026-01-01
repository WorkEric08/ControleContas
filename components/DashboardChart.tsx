
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BillCategory } from '../types';

interface DashboardChartProps {
  categories: BillCategory[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ categories }) => {
  const data = categories.map(cat => ({
    name: cat.name,
    value: cat.items.reduce((acc, curr) => acc + curr.value, 0)
  })).filter(d => d.value > 0);

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444'];

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-600 text-sm italic">
        Aguardando dados para gerar gráfico...
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;
