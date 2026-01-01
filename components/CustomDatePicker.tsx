
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../constants';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD ou 'none' ou ''
  onChange: (value: string) => void;
  renderTrigger?: (open: () => void, formattedValue: string) => React.ReactNode;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, renderTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value && value !== 'none' ? new Date(value + 'T00:00:00') : new Date());
  
  // Estados para o Swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (value && value !== 'none') {
        setViewDate(new Date(value + 'T00:00:00'));
      } else {
        setViewDate(new Date());
      }
      // Bloquear scroll do corpo ao abrir
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, value]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    setSwipeOffset(0);
  };

  const handleNextMonth = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    setSwipeOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setSwipeOffset(e.touches[0].clientX - touchStartX);
  };
  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    if (swipeOffset > 70) handlePrevMonth();
    else if (swipeOffset < -70) handleNextMonth();
    setTouchStartX(null);
    setSwipeOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => setDragStartX(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX === null) return;
    setSwipeOffset(e.clientX - dragStartX);
  };
  const handleMouseUp = () => {
    if (dragStartX === null) return;
    if (swipeOffset > 70) handlePrevMonth();
    else if (swipeOffset < -70) handleNextMonth();
    setDragStartX(null);
    setSwipeOffset(0);
  };

  const handleSelectDay = (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const selectedDate = new Date(`${year}-${month}-${dayStr}T00:00:00`);
    
    if (selectedDate >= today) {
      onChange(`${year}-${month}-${dayStr}`);
      setIsOpen(false);
    }
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleNoDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('none');
    setIsOpen(false);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
  
  const numDays = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);
  
  const days = Array.from({ length: numDays }, (_, i) => i + 1);
  const padding = Array.from({ length: startDay }, (_, i) => i);

  const formattedDisplay = value === 'none' 
    ? 'Sem vencimento'
    : value 
      ? new Date(value + 'T00:00:00').toLocaleDateString('pt-BR') 
      : 'dd/mm/aaaa';

  const calendarModal = isOpen ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Calendário Centralizado */}
      <div 
        className="relative w-full max-w-[340px] bg-[#0c121e] border border-slate-800/80 rounded-[32px] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-10">
          <button 
            type="button" 
            onClick={(e) => handlePrevMonth(e)} 
            className="text-slate-700 hover:text-white transition-colors p-2"
          >
            <Icons.ChevronLeft />
          </button>
          <h4 className="text-[14px] font-black text-white tracking-[0.2em] text-center">
            {monthName} {currentYear}
          </h4>
          <button 
            type="button" 
            onClick={(e) => handleNextMonth(e)} 
            className="text-slate-700 hover:text-white transition-colors p-2"
          >
            <Icons.ChevronRight />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 mb-6">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <span key={d} className="text-[12px] font-black text-slate-600 text-center">{d}</span>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div 
          className="grid grid-cols-7 gap-y-3 transition-transform duration-200"
          style={{ transform: `translateX(${swipeOffset * 0.2}px)` }}
        >
          {padding.map(p => <div key={`p-${p}`} />)}
          
          {days.map(day => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateObj = new Date(dateStr + 'T00:00:00');
            const isSelected = value === dateStr;
            const isPast = dateObj < today;
            
            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={(e) => handleSelectDay(e, day)}
                className={`w-10 h-10 mx-auto text-[13px] font-black rounded-xl transition-all flex items-center justify-center ${
                  isSelected 
                    ? 'bg-[#10b981] text-[#0c121e] shadow-lg shadow-emerald-500/30 scale-110' 
                    : isPast 
                      ? 'text-slate-800 cursor-not-allowed'
                      : 'text-white hover:bg-slate-800/50'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Clear Options */}
        <div className="mt-8 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClearDate}
            className="w-full py-3 bg-slate-900/50 border border-slate-800/50 rounded-2xl text-[10px] font-black text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all uppercase tracking-[0.2em]"
          >
            Remover Vencimento
          </button>
          <button
            type="button"
            onClick={handleNoDate}
            className="w-full py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] font-black text-emerald-500/60 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all uppercase tracking-[0.2em]"
          >
            Nenhum vencimento
          </button>
        </div>

        {/* Footer Navigation Info */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1e293b]"></div>
          <span className="text-[9px] font-black text-[#2a364a] uppercase tracking-[0.25em] whitespace-nowrap">
            Deslize para navegar
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#1e293b]"></div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="w-full">
      {renderTrigger ? (
        renderTrigger(() => setIsOpen(true), formattedDisplay)
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-28 pr-3 py-1.5 text-[10px] text-slate-400 text-left focus:outline-none focus:ring-1 focus:ring-emerald-500 flex items-center justify-between group"
        >
          <span className="group-hover:text-slate-200 transition-colors font-medium">{formattedDisplay}</span>
          <Icons.ChevronDown />
        </button>
      )}

      {calendarModal}
    </div>
  );
};

export default CustomDatePicker;
