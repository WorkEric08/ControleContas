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
      maximumFractionDigits: 2,
      minimumIntegerDigits: 1
    }).format(val);
  };

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [inputValue, setInputValue] = useState(formatValue(item.value));
  const [inputText, setInputText] = useState(item.text);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const minSwipeDistance = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (item.isPaid) return; 
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || item.isPaid) return;
    const currentX = e.targetTouches[0].clientX;
    const offset = currentX - touchStart;
    if (offset > 100) setSwipeOffset(100);
    else if (offset < -100) setSwipeOffset(-100);
    else setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    if (swipeOffset > minSwipeDistance) onUpdate({ isPaid: !item.isPaid });
    else if (swipeOffset < -minSwipeDistance) onDelete();
    setSwipeOffset(0);
    setIsSwiping(false);
    setTouchStart(null);
  };

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

  const isDueToday = useMemo(() => {
    if (!item.dueDate || item.dueDate === 'none' || item.isPaid) return false;
    return new Date(item.dueDate + 'T00:00:00').toDateString() === new Date().toDateString();
  }, [item.dueDate, item.isPaid]);

  const statusColorClass = useMemo(() => {
    if (item.isPaid) return 'bg-slate-700';
    if (isExpired) return 'bg-red-500';
    if (isDueToday) return 'bg-amber-500';
    return isGoal ? 'bg-blue-500' : 'bg-emerald-500';
  }, [item.isPaid, isExpired, isDueToday, isGoal]);

  return (
    <div className="relative overflow-hidden rounded-2xl group/row">
      {!item.isPaid && (
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
          <div className={`flex items-center gap-2 transition-opacity ${swipeOffset > 20 ? 'opacity-100' : 'opacity-0'} ${isGoal ? 'text-blue-500' : 'text-emerald-500'}`}>
            <Icons.Check />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.isPaid ? 'Pendente' : 'Pago'}</span>
          </div>
          <div className={`flex items-center gap-2 text-red-500 transition-opacity ${swipeOffset < -20 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">Excluir</span>
            <Icons.Trash />
          </div>
        </div>
      )}

      <div 
        className={`flex flex-col gap-2 p-3.5 pl-6 transition-all relative z-10 border border-slate-800/40 backdrop-blur-md min-h-[90px] ${
          item.isPaid 
            ? 'bg-slate-900/40 opacity-50' 
            : 'bg-slate-800/20 border-slate-700/30 hover:bg-slate-800/40'
        } ${isSwiping ? 'duration-0' : 'duration-300'}`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-colors ${statusColorClass}`}></div>

        <div className="w-full flex items-center pr-2">
          {isEditingText ? (
            <input 
              autoFocus
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTextBlur()}
              className={`flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 ${isGoal ? 'focus:ring-blue-500' : 'focus:ring-emerald-500'}`}
            />
          ) : (
            <h4 
              onClick={() => !item.isPaid && setIsEditingText(true)}
              className={`text-[16px] font-bold transition-colors cursor-pointer leading-tight break-words ${
                item.isPaid ? 'line-through text-slate-600' : 'text-white'
              }`}
            >
              {item.text || 'Sem nome'}
            </h4>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button 
              onClick={() => onUpdate({ isPaid: !item.isPaid })}
              className={`flex items-center justify-center w-7 h-7 rounded-lg border-2 transition-all shrink-0 ${
                item.isPaid 
                  ? (isGoal ? 'bg-blue-500 border-blue-500 text-slate-950' : 'bg-emerald-500 border-emerald-500 text-slate-950') 
                  : 'bg-slate-900/50 border-slate-700/50 text-slate-700 hover:border-slate-400'
              }`}
            >
              {item.isPaid ? <Icons.Check /> : null}
            </button>

            <div className="flex flex-col min-w-0 flex-1 items-start">
              <div className="flex items-baseline w-full justify-start pr-2">
                {isEditingValue ? (
                  <input 
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={handleValueChange}
                    onBlur={handleValueBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleValueBlur()}
                    className={`h-9 w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-bold focus:ring-1 text-left transition-all ${isGoal ? 'focus:ring-blue-500' : 'focus:ring-emerald-500'}`}
                  />
                ) : (
                  <span 
                    onClick={() => !item.isLocked && !item.isPaid && setIsEditingValue(true)}
                    className={`text-[22px] font-mono font-black transition-colors leading-none tracking-tight ${
                      item.isPaid 
                        ? 'text-slate-600' 
                        : (isGoal 
                            ? 'text-blue-400 cursor-pointer hover:text-blue-300' 
                            : 'text-emerald-500 cursor-pointer hover:text-emerald-400')
                    }`}
                  >
                    {formatValue(item.value)}
                  </span>
                )}
              </div>

              <div className="mt-1.5 w-full flex justify-start">
                <CustomDatePicker 
                  value={item.dueDate || ''}
                  onChange={(newDate) => onUpdate({ dueDate: newDate })}
                  renderTrigger={(open, formatted) => (
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); if (!item.isPaid) open(); }}
                      className={`flex items-center gap-1.5 transition-all shrink-0 justify-start ${item.isPaid ? 'pointer-events-none opacity-20' : 'opacity-40 hover:opacity-100'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${(!item.dueDate || item.dueDate === 'none') ? 'bg-slate-600' : (item.isPaid ? 'bg-slate-700' : (isExpired ? 'bg-red-500' : isDueToday ? 'bg-amber-500' : (isGoal ? 'bg-blue-500' : 'bg-emerald-500')))}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                        {(!item.dueDate || item.dueDate === 'none') ? 'Vencimento' : formatted}
                      </span>
                    </button>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center shrink-0 gap-1.5">
            <div className="flex flex-col -space-y-1">
              <button 
                disabled={isFirst || item.isPaid} 
                onClick={(e) => { e.stopPropagation(); !item.isPaid && onMove?.('up'); }} 
                className={`p-1 rounded transition-all ${isFirst || item.isPaid ? 'opacity-10 cursor-default' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
              >
                <Icons.ChevronUp size={22} />
              </button>
              <button 
                disabled={isLast || item.isPaid} 
                onClick={(e) => { e.stopPropagation(); !item.isPaid && onMove?.('down'); }} 
                className={`p-1 rounded transition-all ${isLast || item.isPaid ? 'opacity-10 cursor-default' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
              >
                <Icons.ChevronDown size={22} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button 
                disabled={item.isPaid}
                onClick={() => !item.isPaid && onUpdate({ isLocked: !item.isLocked })}
                className={`p-2 rounded-lg transition-all ${item.isPaid ? 'opacity-10 cursor-default' : (item.isLocked ? 'text-amber-500 bg-amber-500/10' : 'text-slate-700 hover:text-slate-300')}`}
              >
                {item.isLocked ? <Icons.Lock size={24} /> : <Icons.Unlock size={24} />}
              </button>
              <button 
                disabled={item.isPaid}
                onClick={(e) => { e.stopPropagation(); !item.isPaid && onDelete(); }}
                className={`p-2 rounded-lg transition-all ${item.isPaid ? 'opacity-10 cursor-default' : 'text-slate-700 hover:text-red-500 hover:bg-red-500/10'}`}
              >
                <Icons.Trash size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillItemRow;