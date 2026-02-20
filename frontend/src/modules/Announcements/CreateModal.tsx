import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Send, Paperclip, FileText } from 'lucide-react';
import { UserData } from '../../types/user';
import { fetchAPI } from '../../utils/api'; // 🔥 Importamos o seu utilitário de API!

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSuccess: () => void;
}

export const CreateModal = ({ isOpen, onClose, user, onSuccess }: CreateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    target_dept: '',
    file: null as File | null
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ title: '', content: '', category: '', target_dept: '', file: null });
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepts(true);
      // 🔥 Usando o fetchAPI passando pelo Proxy do Next.js
      const res = await fetchAPI('/auth/departments');
      if (res.ok) setDepartmentsList(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // IMPORTANTE: Para arquivos, usamos FormData em vez de JSON
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('category', formData.category);
      if (formData.target_dept) data.append('target_dept', formData.target_dept);
      if (formData.file) data.append('file', formData.file);

      // 🔥 Usando fetchAPI, SEM a barra no final, e deixando o navegador lidar com o Cookie!
      // O seu fetchAPI já sabe que não deve forçar 'application/json' quando é FormData
      const res = await fetchAPI('/announcements', {
        method: 'POST',
        body: data
      });

      if (!res.ok) throw new Error('Falha ao postar');
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao publicar aviso. Verifique se o arquivo não é grande demais ou se tem permissão.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const canPostGeneral = user.role === 'admin' || user.permissions?.includes('post_general');
  const canPostTech = user.role === 'admin' || user.permissions?.includes('post_tech');
  const canPostOps = ['admin', 'diretoria', 'coordenador', 'supervisor'].includes(user.role);
  const canPostSector = ['supervisor', 'coordenador'].includes(user.role) || canPostGeneral;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <h3 className="font-black text-[#002147] uppercase tracking-widest text-lg mb-6">Novo Comunicado</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required
            type="text" 
            placeholder="Título do aviso"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147]"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <select 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147]"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value, target_dept: ''})}
            >
              <option value="">Categoria...</option>
              {canPostGeneral && <option value="GENERAL">Geral</option>}
              {canPostTech && <option value="TECH">Técnico</option>}
              {canPostOps && <option value="OPS_MGMT">Gestão</option>}
              {canPostSector && <option value="SECTOR">Setor</option>}
            </select>

            {formData.category === 'SECTOR' && (
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700"
                value={formData.target_dept}
                onChange={e => setFormData({...formData, target_dept: e.target.value})}
              >
                <option value="">Destino...</option>
                {canPostGeneral ? departmentsList.map(d => <option key={d} value={d}>{d}</option>) : user.depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>

          <textarea 
            required
            rows={4}
            placeholder="Mensagem..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-600 resize-none"
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
          />

          {/* Área de Anexo */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Anexo (Opcional)</label>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-[#002147] hover:text-[#002147] transition-all"
              >
                <Paperclip size={16} /> 
                {formData.file ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
              </button>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={e => setFormData({...formData, file: e.target.files?.[0] || null})}
              />
              {formData.file && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl animate-in fade-in zoom-in duration-200">
                  <FileText size={14} className="text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-700 truncate max-w-[120px]">{formData.file.name}</span>
                  <button type="button" onClick={() => setFormData({...formData, file: null})} className="text-blue-400 hover:text-blue-600">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
             <button 
               type="submit" 
               disabled={loading || !formData.category}
               className="bg-[#002147] text-[#D4AF37] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Publicar</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};