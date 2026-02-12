import React, { useState, useEffect } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { UserData } from '../../types/user';

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
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    target_dept: ''
  });

  // Carrega a lista de departamentos do AD quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setFormData({ title: '', content: '', category: '', target_dept: '' });
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepts(true);
      const token = localStorage.getItem('zc_token');
      const apiHost = window.location.hostname;
      
      const res = await fetch(`http://${apiHost}:8000/auth/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDepartmentsList(data);
      }
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error);
    } finally {
      setLoadingDepts(false);
    }
  };

  if (!isOpen || !user) return null;

  // Permissões
  const canPostGeneral = user.role === 'admin' || user.role === 'diretoria' || user.permissions?.includes('post_general');
  const canPostTech = user.role === 'admin' || user.permissions?.includes('post_tech');
  const canPostOps = ['admin', 'diretoria', 'coordenador', 'supervisor'].includes(user.role);
  const canPostSector = ['supervisor', 'coordenador'].includes(user.role) || canPostGeneral;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('zc_token');
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:8000/announcements/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Falha ao postar');
      
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao publicar aviso. Verifique suas permissões.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <h3 className="font-black text-[#002147] uppercase tracking-widest text-lg mb-6">Novo Comunicado</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Resumo do assunto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value, target_dept: ''})}
              >
                <option value="">Selecione...</option>
                {canPostGeneral && <option value="GENERAL">Institucional (Geral)</option>}
                {canPostTech && <option value="TECH">Técnico / TI</option>}
                {canPostOps && <option value="OPS_MGMT">Gestão Operacional</option>}
                {canPostSector && <option value="SECTOR">Aviso Interno de Setor</option>}
              </select>
            </div>

            {formData.category === 'SECTOR' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destino</label>
                {loadingDepts ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center text-xs text-slate-400">
                    <Loader2 className="animate-spin mr-2" size={14} /> Carregando...
                  </div>
                ) : (
                  <select 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    value={formData.target_dept}
                    onChange={e => setFormData({...formData, target_dept: e.target.value})}
                  >
                    <option value="">Para quem?</option>
                    
                    {canPostGeneral ? (
                       // CASO 1: Admin/RH -> Vê TODOS os setores trazidos do AD
                       departmentsList.map(d => (
                         <option key={d} value={d}>{d}</option>
                       ))
                    ) : (
                      // CASO 2: Supervisor -> Só vê os setores onde ele tem permissão (vindo do login dele)
                      user.depts.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))
                    )}
                  </select>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mensagem</label>
            <textarea 
              required
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#002147] resize-none"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Digite o conteúdo do comunicado..."
            />
          </div>

          <div className="pt-2 flex justify-end">
             <button 
               type="submit" 
               disabled={loading || !formData.category}
               className="bg-[#002147] text-[#D4AF37] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Publicar</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};