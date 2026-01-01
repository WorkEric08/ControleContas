import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[300] bg-[#050912] flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Luzes de fundo dinâmicas */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" 
      />

      <div className="relative flex flex-col items-center">
        {/* Logo Animado */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] relative z-10">
            <Icons.Wallet size={40} className="text-slate-950" />
          </div>
          {/* Anéis de pulso */}
          <motion.div 
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 border-2 border-emerald-500/50 rounded-[2.5rem]"
          />
        </motion.div>

        {/* Texto de Loading */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-[900] text-white tracking-[0.3em] uppercase"
          >
            BillFlow
          </motion.h1>
          
          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">
                  Sincronizando Fluxo
                </span>
                <span className="text-[10px] font-mono text-slate-500">{progress}%</span>
             </div>
             
             {/* Barra de Progresso Estilizada */}
             <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                <motion.div 
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${progress}%` }}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Frases Financeiras Aleatórias no Rodapé */}
      <div className="absolute bottom-12 text-center">
         <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-8">
            "Sua clareza financeira começa aqui"
         </p>
      </div>
    </motion.div>
  );
};

export default SplashScreen;