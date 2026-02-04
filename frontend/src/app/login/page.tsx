"use client";

import React, { useState, useEffect } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Componente de Login do ZeroCore v3.0
 * Localização: src/app/login/page.tsx
 * * Correção: Substituição do useRouter por window.location para compatibilidade 
 * e prevenção de loops de redirecionamento.
 */
export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Verificação de segurança para evitar loops
  useEffect(() => {
    // Apenas executa no lado do cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('zc_token');
      const user = localStorage.getItem('zc_user');
      
      // Valida se o token existe e não é uma string de erro (como "undefined")
      if (token && token !== "undefined" && token !== "null" && user) {
        window.location.replace('/');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // Endpoint do backend FastAPI
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Falha na autenticação com o AD');
      }

      if (data.access_token) {
        // Armazenamento seguro dos dados de sessão
        localStorage.setItem('zc_token', data.access_token);
        localStorage.setItem('zc_user', JSON.stringify(data.user));
        
        setSuccess(true);
        
        // Redirecionamento para a raiz após sucesso
        setTimeout(() => {
          window.location.replace('/');
        }, 1000);
      } else {
        throw new Error("O servidor não retornou um token de acesso válido.");
      }

    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor ZeroCore');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-t-4 border-[#D4AF37]">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/10 p-3 rounded-full animate-bounce">
              <ShieldCheck className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#002147] mb-2">Acesso Autorizado</h2>
          <p className="text-gray-500 mb-6 text-sm">Validando credenciais e preparando ambiente...</p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#002147] flex items-center justify-center p-4 font-sans selection:bg-[#D4AF37] selection:text-[#002147]">
      <div className="max-w-md w-full">
        {/* Header de Marca */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4 p-2 bg-white/5 rounded-lg backdrop-blur-sm">
            <h1 className="text-4xl font-black text-white tracking-tighter">
              ZERO<span className="text-[#D4AF37]">CORE</span>
            </h1>
          </div>
          <p className="text-blue-200/60 uppercase text-[10px] font-bold tracking-[0.4em]">MDR Advocacia • Gestão Inteligente</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/5">
          <div className="p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Login</h2>
              <p className="text-sm text-gray-400 mt-1">Insira suas credenciais do Active Directory.</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Usuário de Rede</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-300 group-focus-within:text-[#D4AF37] transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-300 font-medium"
                    placeholder="ex: nome.sobrenome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha do Windows</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-[#D4AF37] transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-300 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-2xl text-xs font-semibold border border-red-100 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-xl shadow-[#D4AF37]/20 text-sm font-bold text-[#002147] bg-[#D4AF37] hover:bg-[#c4a132] active:scale-[0.98] disabled:opacity-50 transition-all uppercase tracking-widest overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Acessar Sistema
                  </span>
                )}
              </button>
            </form>
          </div>

          <div className="px-10 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
            <span className="text-[9px] text-gray-400 font-bold tracking-tighter uppercase">Build 3.0.0-Beta</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">AD Gateway Online</span>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-white/20 text-[9px] font-bold uppercase tracking-[0.3em]">
          Desenvolvido por MDR Tech • Todos os Direitos Reservados
        </p>
      </div>
    </div>
  );
}