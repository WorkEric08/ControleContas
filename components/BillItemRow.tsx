
import React, { useState, useMemo } from 'react';
import { BillItem } from '../types';
import { Icons } from '../constants';
import CustomDatePicker from './CustomDatePicker';

interface BillItemRowProps {
  item: BillItem;
  isGoal?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onUpdate: (updates: Partial<BillItem>) => void;
  onDelete: () => void;
  onMove?: (direction: 'up' | 'down') => void;
}

const BillItemRow: React.FC<BillItemRowProps> = ({ 
  item, 
  isGoal = false, 
  isFirst,
  isLast,
  onUpdate, 
  onDelete,
  onMove
}) => {
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [inputValue, setInputValue] = useState(formatValue(item.value));
  const [inputText, setInputText] = useState(item.text);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value === '' || value === '0') {
      setInputValue('0,00');
      return;
    }
    const floatValue = parseInt(value, 10) / 100;
    setInputValue(formatValue(floatValue));
  };

  const handleValueBlur = () => {
    let cleanValue = inputValue.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleanValue) || 0;
    onUpdate({ value: val });
    setInputValue(formatValue(val));
    setIsEditingValue(false);
  };

  const handleTextBlur = () => {
    if (inputText.trim()) {
      onUpdate({ text: inputText.trim() });
    } else {
      setInputText(item.text);
    }
    setIsEditingText(false);
  };

  const isExpired = useMemo(() => {
    if (!item.dueDate || item.dueDate === 'none' || item.isPaid) return false;
    const date = new Date(item.dueDate + 'T00:00:00');
    date.setHours(23, 59, 59, 999);
    return date < new Date();
  }, [item.dueDate, item.isPaid]);

  const accentColor = isGoal ? 'text-blue-500' : 'text-emerald-500';
  const accentBg = isGoal ? 'bg-blue-500' : 'bg-emerald-500';

  return (
    <div className={`relative flex flex-col p-3 rounded-2xl border border-slate-700/40 bg-[#050912]/50 transition-all ${item.isPaid ? 'opacity-30' : ''}`}>
      
      {/* Barra de Status Lateral */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${accentBg}`}></div>

      {/* 1. Título da Conta - Outline apenas no foco */}
      <div className="w-full mb-1.5">
        {isEditingText ? (
          <input 
            autoFocus 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onBlur={handleTextBlur} 
            onKeyDown={(e) => e.key === 'Enter' && handleTextBlur()}
            className="bg-slate-900 text-[12px] text-white border border-transparent focus:border-slate-700 px-2 py-1 rounded-lg w-full focus:outline-none transition-all font-black uppercase tracking-tight" 
          />
        ) : (
          <p 
            onClick={() => !item.isPaid && setIsEditingText(true)} 
            className={`text-[12px] font-black uppercase tracking-tight truncate w-full py-0.5 pl-1 ${item.isPaid ? 'line-through text-slate-600' : 'text-white cursor-text hover:text-slate-300 transition-colors'}`}
          >
            {item.text}
          </p>
        )}
      </div>

      {/* 2. Área de Conteúdo: Checklist, Valor e Ações */}
      <div className="flex items-center gap-2.5 w-full">
        
        {/* Checklist */}
        <button 
          onClick={() => onUpdate({ isPaid: !item.isPaid })}
          className={`w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 ${
            item.isPaid 
              ? (isGoal ? 'bg-blue-500 border-blue-500 text-slate-950' : 'bg-emerald-500 border-emerald-500 text-slate-950') 
              : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'
          }`}
        >
          {item.isPaid && <Icons.Check size={18} />}
        </button>

        {/* Bloco Central: Valor e Vencimento */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between">
            {/* Valor da conta - Outline apenas no foco */}
            <div className="flex-1">
              {isEditingValue ? (
                <input 
                  autoFocus 
                  type="text" 
                  value={inputValue} 
                  onChange={handleValueChange} 
                  onBlur={handleValueBlur} 
                  onKeyDown={(e) => e.key === 'Enter' && handleValueBlur()}
                  className={`bg-slate-900 border border-transparent focus:border-slate-700 rounded-lg px-2 py-0.5 text-[16px] font-black w-full focus:outline-none transition-all ${accentColor}`} 
                />
              ) : (
                <span 
                  onClick={() => !item.isPaid && setIsEditingValue(true)} 
                  className={`text-[16px] font-black tracking-tighter cursor-text block leading-none pl-1 ${item.isPaid ? 'text-slate-700' : accentColor}`}
                >
                  {formatValue(item.value)}
                </span>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              <div className={`flex flex-col items-center gap-0 opacity-20 transition-opacity mr-0.5 ${item.isPaid ? 'hidden' : 'hover:opacity-100'}`}>
                <button disabled={isFirst} onClick={() => onMove?.('up')} className={`p-0.5 transition-all ${isFirst ? 'opacity-0 cursor-default' : 'text-slate-500 hover:text-white'}`}>
                  <Icons.ChevronUp size={14} />
                </button>
                <button disabled={isLast} onClick={() => onMove?.('down')} className={`p-0.5 transition-all ${isLast ? 'opacity-0 cursor-default' : 'text-slate-500 hover:text-white'}`}>
                  <Icons.ChevronDown size={14} />
                </button>
              </div>

              <button 
                onClick={() => !item.isPaid && onUpdate({ isLocked: !item.isLocked })} 
                disabled={item.isPaid}
                className={`p-1 transition-all ${item.isPaid ? 'text-slate-800 cursor-not-allowed opacity-10' : (item.isLocked ? 'text-amber-500' : 'text-slate-500 hover:text-slate-400')}`}
                title={item.isLocked ? "Item Fixo" : "Item Variável"}
              >
                {item.isLocked ? <Icons.Lock size={19} /> : <Icons.Unlock size={19} />}
              </button>
              
              <button 
                onClick={() => !item.isPaid && onDelete()} 
                disabled={item.isPaid}
                className={`p-1 transition-all ${item.isPaid ? 'text-slate-800 cursor-not-allowed opacity-10' : 'text-slate-500 hover:text-red-500'}`}
                title="Excluir"
              >
                <Icons.Trash size={19} />
              </button>
            </div>
          </div>

          {/* Vencimento */}
          <div className="mt-1 flex justify-start">
            <CustomDatePicker 
              value={item.dueDate || ''}
              onChange={(newDate) => onUpdate({ dueDate: newDate })}
              renderTrigger={(open) => (
                <div 
                  onClick={(e) => { e.stopPropagation(); !item.isPaid && open(); }}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    item.isPaid 
                      ? 'bg-slate-900/10 border-transparent text-slate-700 cursor-default'
                      : isExpired 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' 
                        : 'bg-slate-900/40 border-transparent text-slate-500 hover:border-slate-700/60 active:border-slate-700'
                  }`}
                >
                  <Icons.Clock size={10} className={isExpired ? 'animate-pulse' : ''} />
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {item.dueDate && item.dueDate !== 'none' 
                      ? new Date(item.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                      : 'S/ DATA'}
                  </span>
                </div>
              )}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default BillItemRow;
