
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
    <div className={`relative flex flex-col p-4 rounded-2xl border border-slate-800/40 bg-[#050912]/50 transition-all ${item.isPaid ? 'opacity-30' : ''}`}>
      
      {/* Barra de Status Lateral - Reduzida conforme solicitado (top-4 bottom-4) */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${accentBg}`}></div>

      {/* 1. Título da Conta - Linha Superior Independente */}
      <div className="w-full mb-2">
        {isEditingText ? (
          <input 
            autoFocus 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onBlur={handleTextBlur} 
            className="bg-slate-800 text-[13px] text-white border-none px-2 py-1 rounded w-full focus:ring-1 focus:ring-slate-600 font-black uppercase tracking-tight" 
          />
        ) : (
          <p 
            onClick={() => !item.isPaid && setIsEditingText(true)} 
            className={`text-[13px] font-black uppercase tracking-tight truncate w-full py-0.5 pl-0.5 ${item.isPaid ? 'line-through text-slate-600' : 'text-white cursor-text hover:text-slate-300 transition-colors'}`}
          >
            {item.text}
          </p>
        )}
      </div>

      {/* 2. Área de Conteúdo Flexível: Checklist à esquerda, Valor/Data no centro, Ações à direita */}
      <div className="flex items-center gap-3 w-full">
        
        {/* Checklist: Centralizado verticalmente entre o Valor e o Vencimento */}
        <button 
          onClick={() => onUpdate({ isPaid: !item.isPaid })}
          className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 ${
            item.isPaid 
              ? (isGoal ? 'bg-blue-500 border-blue-500 text-slate-950' : 'bg-emerald-500 border-emerald-500 text-slate-950') 
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
          }`}
        >
          {item.isPaid && <Icons.Check size={18} />}
        </button>

        {/* Bloco Central: Valor (topo) e Vencimento (base) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between">
            {/* Valor da conta */}
            <div className="flex-1">
              {isEditingValue ? (
                <input 
                  autoFocus 
                  type="text" 
                  value={inputValue} 
                  onChange={handleValueChange} 
                  onBlur={handleValueBlur} 
                  className={`bg-transparent text-[18px] font-black border-none p-0 w-full focus:ring-0 ${accentColor}`} 
                />
              ) : (
                <span 
                  onClick={() => !item.isPaid && setIsEditingValue(true)} 
                  className={`text-[18px] font-black tracking-tighter cursor-text block leading-none ${item.isPaid ? 'text-slate-700' : accentColor}`}
                >
                  {formatValue(item.value)}
                </span>
              )}
            </div>

            {/* Ações: Desabilitadas se a conta estiver paga */}
            <div className="flex items-center gap-0.5 shrink-0 ml-2">
              <div className={`flex flex-col items-center gap-0 opacity-20 transition-opacity mr-1 ${item.isPaid ? 'hidden' : 'hover:opacity-100'}`}>
                <button disabled={isFirst} onClick={() => onMove?.('up')} className={`p-0.5 transition-all ${isFirst ? 'opacity-0 cursor-default' : 'text-slate-500 hover:text-white'}`}>
                  <Icons.ChevronUp size={12} />
                </button>
                <button disabled={isLast} onClick={() => onMove?.('down')} className={`p-0.5 transition-all ${isLast ? 'opacity-0 cursor-default' : 'text-slate-500 hover:text-white'}`}>
                  <Icons.ChevronDown size={12} />
                </button>
              </div>

              <button 
                onClick={() => !item.isPaid && onUpdate({ isLocked: !item.isLocked })} 
                disabled={item.isPaid}
                className={`p-1.5 transition-all ${item.isPaid ? 'text-slate-800 cursor-not-allowed opacity-10' : (item.isLocked ? 'text-amber-500' : 'text-slate-800 hover:text-slate-400')}`}
                title={item.isLocked ? "Item Fixo" : "Item Variável"}
              >
                {item.isLocked ? <Icons.Lock size={16} /> : <Icons.Unlock size={16} />}
              </button>
              
              <button 
                onClick={() => !item.isPaid && onDelete()} 
                disabled={item.isPaid}
                className={`p-1.5 transition-all ${item.isPaid ? 'text-slate-800 cursor-not-allowed opacity-10' : 'text-slate-800 hover:text-red-500'}`}
                title="Excluir"
              >
                <Icons.Trash size={16} />
              </button>
            </div>
          </div>

          {/* Vencimento: Clicável para abrir o calendário, menos arredondado (rounded-md) */}
          <div className="mt-1 flex justify-start">
            <CustomDatePicker 
              value={item.dueDate || ''}
              onChange={(newDate) => onUpdate({ dueDate: newDate })}
              renderTrigger={(open) => (
                <div 
                  onClick={(e) => { e.stopPropagation(); !item.isPaid && open(); }}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    item.isPaid 
                      ? 'bg-slate-900/10 border-slate-800/10 text-slate-700 cursor-default'
                      : isExpired 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' 
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-500 hover:border-slate-700'
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
