
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { BillCategory, BillItem, MonthData, UserProfile } from './types';
import { Icons } from './constants';
import CategoryCard from './components/CategoryCard';
import StatsSummary from './components/StatsSummary';
import Modal from './components/Modal';
import ProfileModal from './components/ProfileModal';
import OnboardingScreen from './components/OnboardingScreen';
import SplashScreen from './components/SplashScreen';

const STORAGE_KEY = 'billflow_pro_v2_data';
const USER_KEY = 'billflow_user_profile';
const THEME_KEY = 'billflow_theme_pref';
const ONBOARDING_KEY = 'billflow_onboarding_complete';

const TypingWelcome: React.FC<{ name: string }> = ({ name }) => {
  const fullText = `BEM-VINDO, ${name}`;
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [name]);

  return (
    <div className="flex items-center gap-2 h-5">
      <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
        {displayedText}
      </span>
      <span className="w-[2px] h-3.5 bg-emerald-500 animate-pulse rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    </div>
  );
};

const App: React.FC = () => {
  const today = new Date();
  const realCurrentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [monthData, setMonthData] = useState<MonthData>({});
  const [selectedMonth, setSelectedMonth] = useState(realCurrentMonth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' as 'expense' | 'goal' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { name: "", username: "", age: "", avatar: "" };
      }
    }
    return { name: "", username: "", age: "", avatar: "" };
  });

  const seedMonthData = useCallback((targetMonth: string, currentData: MonthData): MonthData => {
    if (currentData[targetMonth] && currentData[targetMonth].length > 0) {
      return currentData;
    }
    const existingMonths = Object.keys(currentData).sort();
    const prevMonthKey = existingMonths.filter(m => m < targetMonth).reverse()[0];
    if (!prevMonthKey) return currentData;
    const prevCategories = currentData[prevMonthKey];
    const newCategories: BillCategory[] = prevCategories.map(cat => ({
      ...cat,
      items: cat.items
        .filter(item => item.isLocked)
        .map(item => ({
          ...item,
          id: crypto.randomUUID(),
          isPaid: false,
          createdAt: Date.now()
        }))
    }));
    return { ...currentData, [targetMonth]: newCategories };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#050912';
      document.body.style.color = '#e2e8f0';
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const categories = useMemo(() => monthData[selectedMonth] || [], [monthData, selectedMonth]);

  const availableMonths = useMemo(() => {
    const keys = Object.keys(monthData);
    if (!keys.includes(realCurrentMonth)) keys.push(realCurrentMonth);
    if (!keys.includes(selectedMonth)) keys.push(selectedMonth);
    return [...new Set(keys)].sort().reverse();
  }, [monthData, realCurrentMonth, selectedMonth]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        let data: MonthData = JSON.parse(savedData);
        if (!data[realCurrentMonth]) {
          data = seedMonthData(realCurrentMonth, data);
        }
        setMonthData(data);
      } catch (e) {
        console.error("Error loading data", e);
      }
    }
    const onboardingComplete = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingComplete) setShowOnboarding(true);
  }, [realCurrentMonth, seedMonthData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(monthData));
  }, [monthData]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const updateMonthCategories = (newCategories: BillCategory[]) => {
    setMonthData(prev => ({ ...prev, [selectedMonth]: newCategories }));
  };

  const handleSelectMonth = (mKey: string) => {
    if (!monthData[mKey]) setMonthData(prev => seedMonthData(mKey, prev));
    setSelectedMonth(mKey);
    setIsHistoryModalOpen(false);
  };

  const onUpdateCategory = (categoryId: string, updates: Partial<BillCategory>) => {
    updateMonthCategories(categories.map(c => c.id === categoryId ? { ...c, ...updates } : c));
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    const newCat: BillCategory = {
      id: crypto.randomUUID(),
      name: newCategory.name,
      type: newCategory.type,
      items: [],
      budget: newCategory.type === 'goal' ? 0 : undefined,
      showStats: true
    };
    updateMonthCategories([...categories, newCat]);
    setNewCategory({ name: '', type: 'expense' });
    setIsModalOpen(false);
  };

  const deleteCategory = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      updateMonthCategories(categories.filter(c => c.id !== id));
    }
  };

  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];
    updateMonthCategories(newCategories);
  };

  const addItemToCategory = (categoryId: string, name: string, value: number, dueDate?: string) => {
    updateMonthCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: [...cat.items, {
            id: crypto.randomUUID(),
            text: name,
            value,
            isPaid: false,
            isLocked: false,
            createdAt: Date.now(),
            dueDate: dueDate || 'none'
          }]
        };
      }
      return cat;
    }));
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<BillItem>) => {
    updateMonthCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
        };
      }
      return cat;
    }));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    updateMonthCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
      }
      return cat;
    }));
  };

  const stats = useMemo(() => {
    let total = 0;
    let paid = 0;
    let count = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        total += item.value;
        if (item.isPaid) paid += item.value;
        count++;
      });
    });
    return { total, paid, pending: total - paid, count };
  }, [categories]);

  const formatMonthName = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const saveProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const currentMonthLabel = formatMonthName(selectedMonth);
  const isMonthLabelLong = currentMonthLabel.length > 15;

  return (
    <div className={`min-h-screen pb-20 px-4 sm:px-8 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {(!showSplash && showOnboarding) && <OnboardingScreen onComplete={completeOnboarding} />}
      </AnimatePresence>

      <header className="max-w-7xl mx-auto pt-10 pb-8 mb-8 border-b border-slate-800/20 dark:border-slate-800/40 space-y-8">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-[900] dark:text-white text-slate-900 uppercase tracking-[-0.05em] mb-2.5 transition-colors">
              CONTROLE MENSAL
            </h1>
            <TypingWelcome name={user.username || "USUÁRIO"} />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all overflow-hidden shadow-xl active:scale-95"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Icons.User size={22} />
              )}
            </button>

            <button 
              onClick={toggleTheme}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border transition-all shadow-xl active:scale-95 ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-indigo-500/50 text-indigo-400' 
                  : 'bg-white border-amber-500/50 text-amber-500'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div key={theme} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }}>
                  {theme === 'dark' ? <Icons.Moon size={22} /> : <Icons.Sun size={22} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
           <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex-[1.8] h-11 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 flex items-center justify-between gap-1 hover:border-emerald-500 transition-all active:scale-95 group shadow-sm min-w-0"
          >
            <span 
              className={`flex-1 font-black text-emerald-500 uppercase tracking-wider text-left whitespace-nowrap transition-all duration-300 ${
                isMonthLabelLong ? 'text-[10px] sm:text-[11px]' : 'text-[11px]'
              }`}
            >
              {currentMonthLabel}
            </span>
            <div className="text-slate-500 shrink-0 flex items-center ml-2">
              <Icons.ChevronDown size={16} />
            </div>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-none h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest min-w-0"
          >
            <span className="text-[14px] leading-none font-black">+</span> <span className="whitespace-nowrap">Nova Categoria</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        <StatsSummary stats={stats} />
        
        <Reorder.Group 
          axis={isMobile ? "y" : "x"} 
          values={categories} 
          onReorder={updateMonthCategories}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {categories.map((cat, index) => (
              <Reorder.Item
                key={cat.id}
                value={cat}
                dragListener={!isMobile}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="h-full"
                style={{ cursor: isMobile ? 'default' : 'grab' }}
                whileDrag={!isMobile ? { scale: 1.02, zIndex: 50, cursor: 'grabbing' } : undefined}
              >
                <CategoryCard 
                  category={cat}
                  isFirst={index === 0}
                  isLast={index === categories.length - 1}
                  onDelete={() => deleteCategory(cat.id)}
                  onMove={(dir) => moveCategory(cat.id, dir)}
                  onUpdateCategory={(updates) => onUpdateCategory(cat.id, updates)}
                  onAddItem={(name, value, date) => addItemToCategory(cat.id, name, value, date)}
                  onUpdateItem={(itemId, updates) => updateItem(cat.id, itemId, updates)}
                  onDeleteItem={(itemId) => deleteItem(cat.id, itemId)}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </main>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onSave={saveProfile} />
      
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} onConfirm={() => setIsHistoryModalOpen(false)} title="Histórico Financeiro">
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
          {availableMonths.map(mKey => (
            <button key={mKey} onClick={() => handleSelectMonth(mKey)} className={`w-full text-left px-5 py-4 rounded-xl transition-all flex justify-between items-center border ${selectedMonth === mKey ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'}`} >
              <span className="text-[12px] font-black uppercase tracking-wider">{formatMonthName(mKey)}</span>
              {mKey === realCurrentMonth && <span className="text-[8px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">ATUAL</span>}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={addCategory} title="Nova Categoria" confirmClassName={newCategory.type === 'goal' ? "bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/20" : "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"} >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome da Categoria</label>
            <input type="text" placeholder="Ex: Aluguel" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 dark:text-white text-slate-900 focus:outline-none focus:ring-1 transition-all font-bold ${newCategory.type === 'goal' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-emerald-500 focus:border-emerald-500'}`} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Controle</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setNewCategory({ ...newCategory, type: 'expense' })} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newCategory.type === 'expense' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'}`} >
                <Icons.Receipt />
                <span className="text-[10px] font-black uppercase">Contas</span>
              </button>
              <button onClick={() => setNewCategory({ ...newCategory, type: 'goal' })} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newCategory.type === 'goal' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'}`} >
                <Icons.Target />
                <span className="text-[10px] font-black uppercase">Meta</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
