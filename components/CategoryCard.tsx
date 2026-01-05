
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BillCategory, BillItem } from '../types';
import { Icons } from '../constants';
import BillItemRow from './BillItemRow';
import CustomDatePicker from './CustomDatePicker';

interface CategoryCardProps {
  category: BillCategory;
  isFirst?: boolean;
  isLast?: boolean;
  onDelete: () => void;
  onMove?: (direction: 'up' | 'down') => void;
  onUpdateCategory: (updates: Partial<BillCategory>) => void;
  onAddItem: (name: string, value: number, dueDate?: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<BillItem>) => void;
  onDeleteItem: (itemId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  isFirst,
  isLast,
  onDelete, 
  onMove,
  onUpdateCategory,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const isStatsVisible = category.showStats ?? true;
  const [isEditingName, setIsEditingName] = useState(false);
  const [inputCategoryName, setInputCategoryName] = useState(category.name);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = parseFloat(itemValue.replace(/\D/g, '')) / 100 || 0;
    if (itemName.trim()) {
      onAddItem(itemName, val, itemDate || undefined);
      setItemName('');
      setItemValue('');
      setItemDate('');
      setIsFormOpen(false);
    }
  };

  const handleNameBlur = () => {
    if (inputCategoryName.trim()) {
      onUpdateCategory({ name: inputCategoryName.trim() });
    } else {
      setInputCategoryName(category.name);
    }
    setIsEditingName(false);
  };

  const toggleStats = () => {
    onUpdateCategory({ showStats: !isStatsVisible });
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const index = category.items.findIndex(i => i.id === itemId);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= category.items.length) return;

    const newItems = [...category.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onUpdateCategory({ items: newItems });
  };

  const paidTotal = category.items.reduce((acc, curr) => curr.isPaid ? acc + curr.value : acc, 0);
  const total = category.items.reduce((acc, curr) => acc + curr.value, 0);
  const pendingTotal = total - paidTotal;
  const progressPercent = total === 0 ? 0 : Math.min(Math.round((paidTotal / total) * 100), 100);

  const isGoal = category.type === 'goal';
  const accentColorClass = isGoal ? 'text-blue-500' : 'text-emerald-500';
  const accentBgClass = isGoal ? 'bg-blue-500' : 'bg-emerald-500';

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      setItemValue('');
      return;
    }
    const val = parseInt(value, 10) / 100;
    setItemValue(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(val));
  };

  return (
    <div className="bg-[#0c121e] border border-slate-800/60 rounded-2xl shadow-2xl flex flex-col h-full relative overflow-hidden select-none transition-all hover:border-slate-700/80">
      
      {/* Título no Canto Superior Esquerdo */}
      <div className="absolute top-0 left-0 z-10 px-5 py-2.5 max-w-[65%]">
        {isEditingName ? (
          <input 
            autoFocus
            type="text"
            value={inputCategoryName}
            onChange={(e) => setInputCategoryName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-base text-white focus:outline-none w-full font-black tracking-tight"
          />
        ) : (
          <h3 
            onClick={() => setIsEditingName(true)}
            className={`font-black text-base truncate cursor-pointer hover:opacity-80 transition-opacity ${accentColorClass} tracking-tight uppercase`}
          >
            {category.name}
          </h3>
        )}
      </div>

      {/* Bandeira Superior Direita */}
      <div className={`absolute top-0 right-0 px-5 py-1.5 rounded-bl-2xl z-10 ${accentBgClass} text-slate-950 font-black text-[10px] uppercase tracking-[0.2em]`}>
        {isGoal ? 'Meta' : 'Contas'}
      </div>

      <div className="p-7 pt-12 flex flex-col h-full">
        {/* Header (Ações) */}
        <div className="flex items-center mb-6 justify-end">
          <div className="flex items-center gap-1 shrink-0">
             <div className="flex items-center gap-0.5 mr-1 opacity-30 hover:opacity-100 transition-opacity">
              <button disabled={isFirst} onClick={() => onMove?.('up')} className={`p-1 transition-all ${isFirst ? 'opacity-10 cursor-default' : 'text-slate-500 hover:text-white'}`}>
                <Icons.ChevronUp size={24} />
              </button>
              <button disabled={isLast} onClick={() => onMove?.('down')} className={`p-1 transition-all ${isLast ? 'opacity-10 cursor-default' : 'text-slate-500 hover:text-white'}`}>
                <Icons.ChevronDown size={24} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800/50 pl-2">
              <button 
                onClick={toggleStats} 
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isStatsVisible ? `${accentBgClass}/10 ${accentColorClass}` : 'bg-slate-900/50 text-slate-600 hover:text-white'}`}
                title="Estatísticas"
              >
                <Icons.Chart size={19} />
              </button>
              
              <button 
                onClick={() => setIsFormOpen(!isFormOpen)} 
                className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${
                  isFormOpen 
                    ? `${accentBgClass}/10 ${accentColorClass}` 
                    : 'bg-slate-900/50 text-slate-600 hover:text-white'
                }`}
                title="Adicionar Item"
              >
                <Icons.Plus size={22} />
              </button>
              
              <button 
                onClick={onDelete} 
                className="w-9 h-9 rounded-xl bg-slate-900/50 text-slate-600 hover:text-red-500 transition-all flex items-center justify-center"
                title="Excluir Categoria"
              >
                <Icons.Trash size={19} />
              </button>
            </div>
          </div>
        </div>

        {/* PROGRESSO */}
        <AnimatePresence initial={false}>
          {isStatsVisible && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="bg-[#050912]/60 border border-slate-700/40 rounded-2xl p-5 px-3 -mx-[15px] overflow-hidden"
            >
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 pl-1">Progresso</p>
              <h4 className={`text-xl font-black mb-3 pl-1 ${accentColorClass}`}>{progressPercent}%</h4>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className={`h-full ${accentBgClass} shadow-[0_0_15px_rgba(34,197,94,0.1)]`} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORMULÁRIO DE ADIÇÃO */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/30 p-3 rounded-2xl border border-slate-700/40 mb-6 space-y-2"
            >
              <div className="flex gap-2 w-full items-center">
                <input 
                  autoFocus 
                  type="text" 
                  placeholder="Nome do item..." 
                  value={itemName} 
                  onChange={(e) => setItemName(e.target.value)} 
                  className="flex-1 min-w-0 bg-slate-950 border border-transparent focus:border-slate-700 rounded-xl px-4 py-3 text-[13px] text-white font-bold focus:outline-none transition-all placeholder:text-slate-800" 
                />
                <div className="shrink-0">
                  <CustomDatePicker 
                    value={itemDate} 
                    onChange={setItemDate}
                    renderTrigger={(open) => (
                      <button 
                        type="button" 
                        onClick={open} 
                        className={`w-11 h-11 rounded-xl bg-slate-950 border border-transparent focus:border-slate-700 hover:border-slate-700/30 flex items-center justify-center transition-all group relative ${itemDate && itemDate !== 'none' ? accentColorClass : 'text-slate-700'}`}
                      >
                        <Icons.Calendar size={18} />
                        {itemDate && itemDate !== 'none' && (
                          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${accentBgClass} animate-pulse shadow-sm`}></div>
                        )}
                      </button>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 w-full items-center">
                <input 
                  type="text" 
                  placeholder="Valor R$ 0,00" 
                  value={itemValue} 
                  onChange={handleValueChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="flex-1 min-w-0 bg-slate-950 border border-transparent focus:border-slate-700 rounded-xl px-4 py-3 text-[13px] text-white font-mono font-bold focus:outline-none transition-all placeholder:text-slate-800" 
                />
                <button 
                  type="button"
                  onClick={() => handleAdd()}
                  className={`w-11 h-11 shrink-0 rounded-xl ${accentBgClass} text-slate-950 flex items-center justify-center transition-all shadow-lg hover:brightness-110 active:scale-90`}
                >
                  <Icons.Plus size={22} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTA DE ITENS */}
        <div className="flex-1 mb-4 flex flex-col min-h-[150px]">
          <AnimatePresence mode="popLayout">
            {category.items.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 flex-1">
                <button onClick={() => setIsFormOpen(true)} className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-800 hover:border-emerald-500/50 hover:text-emerald-500 transition-all mb-4">
                  <Icons.Plus size={28} />
                </button>
                <h4 className="text-slate-600 font-black text-xs uppercase tracking-[0.2em]">Vazio</h4>
                <p className="text-slate-700 text-[9px] font-bold uppercase mt-1 text-center">Toque para adicionar um item</p>
              </motion.div>
            ) : (
              <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[400px] pr-1">
                {category.items.map((item, idx) => (
                  <BillItemRow 
                    key={item.id} item={item} isGoal={isGoal}
                    isFirst={idx === 0} isLast={idx === category.items.length - 1}
                    onUpdate={(updates) => onUpdateItem(item.id, updates)}
                    onDelete={() => onDeleteItem(item.id)}
                    onMove={(dir) => moveItem(item.id, dir)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* RODAPÉ ESTATÍSTICO */}
        <div className="pt-6 border-t border-slate-800/40 flex items-center justify-between mt-auto">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">{isGoal ? 'Faltam' : 'Pendente'}</p>
            <p className={`text-xl font-black ${isGoal ? 'text-blue-500' : 'text-emerald-500'}`}>R$ {pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">{isGoal ? 'Guardado' : 'Total Pago'}</p>
            <p className="text-xl font-black text-white">R$ {paidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
