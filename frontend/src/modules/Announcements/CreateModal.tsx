"use client";

import React, { useState } from 'react';
import { 
  X, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { UserData } from '../../types/user';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSuccess: () => void;
}

export const CreateModal = ({ isOpen, onClose, user, onSuccess }: CreateModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [targetDept, setTargetDept] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEPARTMENTS = ['TI', 'RH', 'DP', 'JURÍDICO', 'MARKETING', 'DIRETORIA', 'FINANCEIRO'];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('zc_token');
    try {
      const response = await fetch('http://localhost:8000/announcements/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title, 
          content, 
          category, 
          target_dept: category === 'SECTOR' ? targetDept : null 
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao publicar aviso.');
      }
      
      onSuccess();
      onClose();
      setTitle(''); 
      setContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002147]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-[#002147] uppercase tracking-tighter">Novo Aviso</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Publique para o escritório</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'GENERAL', label: 'Geral' },
              { id: 'TECH', label: 'TI' },
              { id: 'OPS_MGMT', label: 'Operacional' },
              { id: 'SECTOR', label: 'Setor' }
            ].map((cat) => (
              <button 
                key={cat.id} 
                type="button" 
                onClick={() => setCategory(cat.id)}
                className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  category === cat.id 
                  ? 'border-[#D4AF37] bg-yellow-50 text-[#002147] shadow-inner' 
                  : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {category === 'SECTOR' && (
            <select 
              required
              value={targetDept} 
              onChange={(e) => setTargetDept(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-slate-100 border-2 rounded-2xl text-sm font-bold outline-none focus:border-[#D4AF37] transition-colors"
            >
              <option value="">Seleccione o Setor Alvo...</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}

          <div className="space-y-4">
            <input 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Título do Comunicado" 
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-[#D4AF37] transition-colors" 
            />
            <textarea 
              required 
              rows={4} 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Escreva sua mensagem aqui..." 
              className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none text-sm font-medium resize-none focus:border-[#D4AF37] transition-colors" 
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 border border-red-100">
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
            </div>
          )}
        </form>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading} 
            className="w-full py-5 bg-[#002147] text-[#D4AF37] font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-[#001a38] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Confirmar Publicação'}
          </button>
        </div>
      </div>
    </div>
  );
};