
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (user: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(user);
    }
  }, [isOpen, user]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col items-center mb-8">
          {/* Container do Avatar - Removido scale/rotate para estabilidade total */}
          <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 border-4 border-white dark:border-slate-900 overflow-hidden shadow-xl">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500/50">
                  <Icons.User size={48} />
                </div>
              )}
            </div>
            
            {/* Botão de "+" Estático e Estilizado */}
            <div className="absolute -right-1 -bottom-1 bg-emerald-500 text-slate-950 p-2.5 rounded-[1.2rem] shadow-lg border-[5px] border-white dark:border-slate-900 transition-colors hover:bg-emerald-400">
              <Icons.Plus size={18} />
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
          </div>
          
          <h2 className="mt-6 text-xl font-black dark:text-white text-slate-900 uppercase tracking-widest">Seu Perfil</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Personalize sua experiência</p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite seu nome"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 dark:text-white text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
                placeholder="USER"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 dark:text-white text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Idade</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 dark:text-white text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Sair
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-5 rounded-2xl bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
          >
            Salvar Perfil
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
