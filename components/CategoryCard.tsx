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
  const [isStatsVisible, setIsStatsVisible] = useState(true);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [inputCategoryName, setInputCategoryName] = useState(category.name);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(itemValue.replace(',', '.')) || 0;
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
      onUpdateCategory({ name: inputCategoryName.trim().toUpperCase() });
    } else {
      setInputCategoryName(category.name);
    }
    setIsEditingName(false);
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
  
  const targetValue = total || 1;
  const progressPercent = Math.min(Math.round((paidTotal / targetValue) * 100), 100);

  const isGoal = category.type === 'goal';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-full group transition-all hover:border-slate-300 dark:hover:border-slate-700 relative overflow-hidden select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="flex-1 truncate pr-4">
          {isEditingName ? (
            <input 
              autoFocus
              type="text"
              value={inputCategoryName}
              onChange={(e) => setInputCategoryName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[16px] dark:text-white text-slate-900 focus:outline-none w-full font-bold"
            />
          ) : (
            <h3 
              onClick={() => setIsEditingName(true)}
              className={`font-black text-lg truncate cursor-pointer hover:opacity-80 transition-opacity ${isGoal ? 'text-blue-500' : 'text-emerald-400'}`}
            >
              {category.name}
            </h3>
          )}
        </div>
        
        <div className="flex gap-1 items-center">
          {onMove && (
            <div className="flex items-center gap-1 mr-2">
              <button 
                disabled={isFirst}
                onClick={(e) => { e.stopPropagation(); onMove('up'); }}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isFirst ? 'opacity-20 cursor-default' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="Mover Anterior"
              >
                {/* Desktop: Esquerda | Mobile: Cima */}
                <div className="md:hidden"><Icons.ChevronUp size={16} /></div>
                <div className="hidden md:block"><Icons.ChevronLeft size={16} /></div>
              </button>
              <button 
                disabled={isLast}
                onClick={(e) => { e.stopPropagation(); onMove('down'); }}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isLast ? 'opacity-20 cursor-default' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="Mover Próximo"
              >
                {/* Desktop: Direita | Mobile: Baixo */}
                <div className="md:hidden"><Icons.ChevronDown size={16} /></div>
                <div className="hidden md:block"><Icons.ChevronRight size={16} /></div>
              </button>
            </div>
          )}

          <div className="relative flex gap-1 items-center">
            <div className={`absolute top-[-36px] left-0 right-[-20px] h-8 flex items-center justify-center text-[10px] font-black uppercase tracking-widest rounded-bl-xl z-20 shadow-md ${isGoal ? 'bg-blue-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
              {isGoal ? 'Meta' : 'Contas'}
            </div>

            <button 
              onClick={() => setIsStatsVisible(!isStatsVisible)}
              className={`p-2 rounded-lg transition-all ${!isStatsVisible ? 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' : (isGoal ? 'text-blue-400 bg-blue-500/10' : 'text-emerald-400 bg-emerald-500/10')}`}
            >
              <Icons.Chart size={18} />
            </button>
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`p-2 rounded-lg transition-all ${isFormOpen ? (isGoal ? 'bg-blue-500 text-slate-950' : 'bg-emerald-500 text-slate-950') : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Icons.Plus size={18} />
            </button>
            <button 
              onClick={onDelete}
              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <Icons.Trash size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isStatsVisible ? 'max-h-32 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/50">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black">Progresso</span>
              <span className={`text-sm font-black ${isGoal ? 'text-blue-500' : 'text-emerald-400'}`}>{progressPercent}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${isGoal ? 'bg-blue-500' : 'bg-emerald-500'}`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isFormOpen ? 'max-h-56 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0 overflow-hidden'}`}>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Novo item..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className={`flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:ring-1 ${isGoal ? 'focus:ring-blue-500' : 'focus:ring-emerald-500'}`}
            />
            <input 
              type="text" 
              placeholder="0,00"
              value={itemValue}
              onChange={(e) => setItemValue(e.target.value)}
              className={`w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-2 text-xs dark:text-white text-slate-900 text-right focus:outline-none focus:ring-1 ${isGoal ? 'focus:ring-blue-500' : 'focus:ring-emerald-500'}`}
            />
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <CustomDatePicker 
                value={itemDate}
                onChange={setItemDate}
                renderTrigger={(open, formatted) => (
                  <button 
                    type="button"
                    onClick={open}
                    className="w-full flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-[10px] transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${itemDate && itemDate !== 'none' ? (isGoal ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                    <span className={`font-black uppercase tracking-wider ${itemDate ? "dark:text-slate-200 text-slate-900" : "text-slate-400 dark:text-slate-500"}`}>
                      {!itemDate ? "+ Vencimento" : itemDate === 'none' ? "Sem data" : formatted}
                    </span>
                  </button>
                )}
              />
            </div>
            <button 
              type="submit"
              className={`px-4 h-9 rounded-lg transition-all active:scale-90 flex items-center justify-center shrink-0 ${isGoal ? 'bg-blue-500 text-slate-950 shadow-lg' : 'bg-emerald-500 text-slate-950 shadow-lg'}`}
            >
              <Icons.Plus size={16} />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[450px] custom-scrollbar pr-1 space-y-2 mb-4">
        <motion.div layout className="space-y-2">
          <AnimatePresence mode="popLayout">
            {category.items.length === 0 && !isFormOpen ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-5 group/empty cursor-pointer"
                onClick={() => setIsFormOpen(true)}
              >
                <div className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 group-hover/empty:scale-110 group-hover/empty:border-solid ${isGoal ? 'border-blue-500/20 text-blue-500/40 group-hover/empty:border-blue-500 group-hover/empty:text-blue-500 group-hover/empty:bg-blue-500/5' : 'border-emerald-500/20 text-emerald-500/40 group-hover/empty:border-emerald-500 group-hover/empty:text-emerald-500 group-hover/empty:bg-emerald-500/5'}`}>
                  <Icons.Plus size={20} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Vazio</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Toque para adicionar um item</p>
                </div>
              </motion.div>
            ) : (
              category.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <BillItemRow 
                    item={item}
                    isGoal={isGoal}
                    isFirst={index === 0}
                    isLast={index === category.items.length - 1}
                    onUpdate={(updates) => onUpdateItem(item.id, updates)}
                    onDelete={() => onDeleteItem(item.id)}
                    onMove={(dir) => moveItem(item.id, dir)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase font-black">
            {isGoal ? 'Faltam' : 'Pendente'}
          </span>
          <span className={`text-sm font-black ${isGoal ? 'text-blue-500' : 'text-emerald-400'}`}>
            R$ {pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-slate-500 uppercase font-black">
            {isGoal ? 'Guardado' : 'Total Pago'}
          </span>
          <span className="text-sm font-black dark:text-slate-300 text-slate-700">
            R$ {paidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;