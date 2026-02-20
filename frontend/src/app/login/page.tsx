"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Loader2, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');
    setDebugInfo('');

    try {
      // 🔥 MUDANÇA: Usando a rota de Proxy do Next.js (/api) para login seguro!
      const apiUrl = `/api/auth/token`;
      
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('password', formData.password);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      let data;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Erro do Servidor (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.detail || `Erro ${res.status}: Falha na autenticação`);
      }

      if (data.user) {
        // Salvamos apenas os dados do usuário. O Cookie viaja invisível!
        localStorage.setItem('zc_user', JSON.stringify(data.user));
        
        // Empurramos o usuário pro Dashboard
        window.location.href = '/dashboard'; 
      } else {
        throw new Error('Resposta incompleta do servidor.');
      }

    } catch (err: any) {
      console.error("❌ Login Error:", err);
      let msg = err.message || 'Erro desconhecido.';
      
      if (msg === "Failed to fetch") {
        msg = "Não foi possível conectar à API.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#002147]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-[#002147] text-[#D4AF37] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-500">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-[#002147] tracking-tighter uppercase italic">ZeroCore</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">MDR Advocacia • Intranet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle size={18} />
                <span className="text-xs font-bold">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Usuário de Rede</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002147] transition-colors">
                <User size={18} />
              </div>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium"
                placeholder="ex: rildon.santos"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Senha</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002147] transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#002147] text-[#D4AF37] py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Acessar Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}