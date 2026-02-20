"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Save, User, FileText, Clock, AlertCircle } from 'lucide-react';

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = "/api";
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: { 
        'Content-Type': 'application/json',
        ...options.headers 
      },
      credentials: 'include',
    });
    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
        window.location.href = '/login';
      }
      return Promise.reject(new Error("Sessão Expirada"));
    }
    return response;
  } catch (error) { throw error; }
};

export default function EmployeeProfile({ username, onBack }: { username: string, onBack: () => void }) {
  const [emp, setEmp] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('CADASTRO');

  // 🔥 PROVISÓRIO: Até ligarmos o AuthContext real, deixamos liberado para o teste.
  // No mundo real, isHR viria do usuário logado.
  const isHR = true; 
  const isSelf = true;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEmp = await fetchAPI(`/employees/${username}`);
        if (resEmp.ok) {
          const data = await resEmp.json();
          setEmp(data);
          setFormData(data);
        }
      } catch (e) { console.error("Erro na carga"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchAPI(`/employees/${username}`, {
        method: 'PUT',
        body: JSON.stringify(formData) 
      });
      if (res.ok) {
        alert("Perfil atualizado com sucesso!");
        // Atualiza os dados no cabeçalho sem precisar recarregar a tela
        setEmp({ ...emp, ...formData });
      } else {
        alert("Erro ao atualizar o perfil. Você tem permissão de Admin/RH?");
      }
    } catch (e) { alert("Falha na conexão"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#002147]" size={40} /></div>;
  if (!emp) return <div className="p-20 text-center uppercase font-black text-xs text-red-500">Erro ao carregar perfil.</div>;

  // 🔥 CLASSE PADRÃO DE INPUTS CORRIGIDA
  // text-slate-900 deixa a fonte preta escura
  // disabled:bg-slate-200 deixa a caixa cinza escuro quando travada
  // disabled:opacity-100 impede que o texto fique transparente/invisível
  const inputBaseClass = "w-full border border-slate-200 rounded-xl px-4 py-3 mt-1 text-sm font-black text-slate-900 bg-white focus:ring-2 focus:ring-[#002147] outline-none disabled:bg-slate-200 disabled:text-slate-900 disabled:opacity-100 transition-all placeholder:text-slate-400";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase hover:text-[#002147] transition-colors">
        <ArrowLeft size={16} /> Voltar para a lista
      </button>

      {/* Cabeçalho do Perfil */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-[#002147] text-[#D4AF37] rounded-full flex items-center justify-center text-3xl font-black shadow-inner">
          {emp.full_name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#002147] uppercase tracking-tighter">{emp.full_name}</h1>
          {/* Atualiza em tempo real caso o DP mude o cargo/setor */}
          <p className="text-slate-400 font-bold text-xs uppercase">{emp.title} | {emp.department}</p>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'CADASTRO', icon: User, label: 'Dados Cadastrais' },
          { id: 'DOCUMENTOS', icon: FileText, label: 'Documentos' },
          { id: 'PONTO', icon: Clock, label: 'Controle de Ponto' },
          { id: 'PENDENCIAS', icon: AlertCircle, label: 'Pendências' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-[#002147] text-[#D4AF37] shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[50vh]">
        
        {/* ABA: DADOS CADASTRAIS */}
        {activeTab === 'CADASTRO' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2">
            
            {/* Seção DP */}
            <div>
              <h3 className="text-[#002147] font-black text-xs uppercase tracking-widest mb-4 border-b pb-2 border-slate-100">Dados Corporativos (Exclusivo DP)</h3>
              
              {/* 🔥 NOVOS CAMPOS: Setor, Cargo, Unidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Setor</label>
                  {/* Ao alterar o departamento, nós atualizamos o array `depts` também para o AD sync funcionar! */}
                  <input type="text" disabled={!isHR} className={inputBaseClass} value={formData.department || ''} onChange={(e) => setFormData({...formData, department: e.target.value, depts: [e.target.value]})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Cargo / Função</label>
                  <input type="text" disabled={!isHR} className={inputBaseClass} value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Unidade</label>
                  <input type="text" disabled={!isHR} className={inputBaseClass} value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              {/* CPF e Datas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">CPF</label>
                  <input type="text" disabled={!isHR} className={inputBaseClass} value={formData.cpf || ''} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Data de Admissão</label>
                  <input type="date" disabled={!isHR} className={inputBaseClass} value={formData.admission_date || ''} onChange={(e) => setFormData({...formData, admission_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Data de Desligamento</label>
                  <input type="date" disabled={!isHR} className={inputBaseClass} value={formData.termination_date || ''} onChange={(e) => setFormData({...formData, termination_date: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Seção Pessoal */}
            <div>
              <h3 className="text-[#002147] font-black text-xs uppercase tracking-widest mb-4 border-b pb-2 border-slate-100">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Telefone / WhatsApp</label>
                  <input type="text" disabled={!isSelf && !isHR} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputBaseClass} value={formData.phone || ''} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Data de Nascimento</label>
                  <input type="date" disabled={!isSelf && !isHR} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className={inputBaseClass} value={formData.birth_date || ''} />
                </div>
              </div>
            </div>

            {/* Contato de Emergência */}
            <div>
              <h3 className="text-[#002147] font-black text-xs uppercase tracking-widest mb-4 border-b pb-2 border-slate-100">Contato de Emergência</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nome do Contato</label>
                  <input type="text" disabled={!isSelf && !isHR} onChange={(e) => setFormData({...formData, emergency_name: e.target.value})} className={inputBaseClass} value={formData.emergency_name || ''} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Telefone de Emergência</label>
                  <input type="text" disabled={!isSelf && !isHR} onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})} className={inputBaseClass} value={formData.emergency_phone || ''} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
               <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-[#002147] text-[#D4AF37] px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg"
               >
                 {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Salvar Alterações</>}
               </button>
            </div>
          </div>
        )}

        {/* ABA: DOCUMENTOS */}
        {activeTab === 'DOCUMENTOS' && (
          <div className="h-full flex items-center justify-center py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl animate-in fade-in">
            <div className="flex flex-col items-center gap-4">
              <FileText size={40} className="opacity-50" />
              Módulo de Documentos em Construção
            </div>
          </div>
        )}

        {/* ABA: PONTO */}
        {activeTab === 'PONTO' && (
          <div className="h-full flex items-center justify-center py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl animate-in fade-in">
             <div className="flex flex-col items-center gap-4">
              <Clock size={40} className="opacity-50" />
              Integração com Ponto Eletrônico em Breve
            </div>
          </div>
        )}

        {/* ABA: PENDÊNCIAS */}
        {activeTab === 'PENDENCIAS' && (
          <div className="h-full flex items-center justify-center py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl animate-in fade-in">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle size={40} className="opacity-50 text-green-500" />
              Nenhuma pendência encontrada
            </div>
          </div>
        )}

      </div>
    </div>
  );
}