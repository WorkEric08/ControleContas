import React from 'react';
import { Icons } from '../constants';

interface StatsSummaryProps {
  stats: {
    total: number;
    pending: number;
    paid: number;
    count: number;
  };
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard 
        label="Total Geral" 
        value={`R$ ${stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
        subtext={`${stats.count} itens no total`}
        color="dark:text-white text-slate-900"
        icon={<Icons.Receipt />}
        iconBg="bg-blue-500/10 text-blue-500"
        borderColor="border-slate-200 dark:border-slate-800"
      />
      <StatCard 
        label="Restante a Pagar" 
        value={`R$ ${stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
        subtext="Pendente este mês"
        color="text-red-500"
        icon={<Icons.Clock />}
        iconBg="bg-red-500/10 text-red-500"
        borderColor="border-red-500/20"
      />
      <StatCard 
        label="Total Pago" 
        value={`R$ ${stats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
        subtext="Contas já quitadas"
        color="text-emerald-500"
        icon={<Icons.CheckCircle />}
        iconBg="bg-emerald-500/10 text-emerald-500"
        borderColor="border-emerald-500/20"
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  color: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, color, icon, iconBg, borderColor }) => (
  <div className={`bg-white dark:bg-slate-900 border ${borderColor} rounded-2xl p-5 shadow-xl transition-all hover:scale-[1.02] relative overflow-hidden group`}>
    <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity ${iconBg.split(' ')[1].replace('text-', 'bg-')}`}></div>
    
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <h3 className={`text-2xl font-black ${color} tracking-tight`}>{value}</h3>
        <p className="text-xs text-slate-500 font-medium">{subtext}</p>
      </div>
      
      <div className={`p-3 rounded-xl ${iconBg} shadow-inner`}>
        {icon}
      </div>
    </div>
    
    {label === "Total Geral" && (
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500/30 w-full animate-pulse"></div>
        </div>
    )}
    {label === "Restante a Pagar" && (
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500/30 transition-all duration-1000" style={{ width: '100%' }}></div>
        </div>
    )}
    {label === "Total Pago" && (
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500/30 transition-all duration-1000" style={{ width: '100%' }}></div>
        </div>
    )}
  </div>
);

export default StatsSummary;