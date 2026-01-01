import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "CONTROLE TOTAL",
      description: "Organize suas contas mensais de forma simples e nunca mais perca um vencimento.",
      icon: <Icons.Receipt size={48} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "METAS DEFINIDAS",
      description: "Poupe para seus sonhos. Defina objetivos financeiros e acompanhe seu progresso.",
      icon: <Icons.Target size={48} />,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "DADOS REAIS",
      description: "Visualize sua saúde financeira com estatísticas detalhadas e gráficos intuitivos.",
      icon: <Icons.Chart size={48} />,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#050912] flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full flex flex-col items-center text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className={`w-24 h-24 rounded-[2rem] ${steps[step].bg} ${steps[step].color} flex items-center justify-center mb-10 shadow-2xl`}>
              {steps[step].icon}
            </div>
            
            <h2 className="text-3xl font-[900] text-white uppercase tracking-tighter mb-4 leading-none">
              {steps[step].title}
            </h2>
            
            <p className="text-slate-400 font-medium leading-relaxed px-4">
              {steps[step].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step Indicators */}
        <div className="flex gap-2 mt-12 mb-16">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-800'}`} 
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          className="w-full py-5 bg-white text-[#050912] font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all flex items-center justify-center gap-3 group"
        >
          {step === steps.length - 1 ? "Começar Jornada" : "Próximo"}
          <Icons.ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={onComplete}
          className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          Pular Introdução
        </button>
      </div>

      <div className="absolute bottom-10 flex items-center gap-2 opacity-20">
        <div className="w-1 h-1 bg-white rounded-full" />
        <span className="text-[10px] font-black tracking-widest text-white uppercase">BillFlow v2.0</span>
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </motion.div>
  );
};

export default OnboardingScreen;