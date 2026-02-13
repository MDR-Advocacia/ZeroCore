import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle, Archive, History, User, Clock, Loader2, Bell, AlertCircle, RefreshCw } from 'lucide-react';

interface LogEntry { name: string; dept: string; }
interface AnnouncementLogs { acknowledged: LogEntry[]; pending: LogEntry[]; }

export const AnnouncementDetailModal = ({ ann, user, onClose, onRefresh }: any) => {
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<AnnouncementLogs | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isManagement = user && (
    user.role === 'admin' || 
    user.role === 'diretoria' || 
    user.role === 'coordenador' ||
    user.permissions?.includes('post_general') ||
    user.permissions?.includes('post_tech')
  );

  const fetchLogs = async () => {
    const token = localStorage.getItem('zc_token');
    const apiHost = window.location.hostname;
    try {
      setLoadingLogs(true);
      setError(null);
      const res = await fetch(`http://${apiHost}:8000/announcements/${ann.id}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        setError("Não foi possível carregar os logs de auditoria.");
      }
    } catch (e) { 
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAcknowledge = async () => {
    const token = localStorage.getItem('zc_token');
    const apiHost = window.location.hostname;
    try {
      setLoading(true);
      const res = await fetch(`http://${apiHost}:8000/announcements/${ann.id}/acknowledge`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        alert("Erro ao registrar ciência.");
      }
    } catch (e) { 
      alert("Erro de conexão."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleToggleArchive = async () => {
    const action = ann.is_archived ? 'unarchive' : 'archive';
    const confirmMsg = ann.is_archived 
      ? "Deseja restaurar este comunicado para o mural principal?" 
      : "Deseja arquivar este comunicado? Ele sairá do mural principal.";

    if (!window.confirm(confirmMsg)) return;

    const token = localStorage.getItem('zc_token');
    const apiHost = window.location.hostname;
    try {
      setLoading(true);
      const res = await fetch(`http://${apiHost}:8000/announcements/${ann.id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        alert(`Erro ao ${ann.is_archived ? 'restaurar' : 'arquivar'} o comunicado.`);
      }
    } catch (e) { 
      alert("Erro de conexão."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className={`bg-white rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${showLogs ? 'w-full max-w-6xl h-[85vh]' : 'w-full max-w-2xl max-h-[90vh]'}`}>
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className={`${ann.is_archived ? 'bg-slate-400' : 'bg-[#002147]'} text-[#D4AF37] p-3 rounded-2xl shadow-lg transition-colors`}>
                <Bell size={24} />
             </div>
             <div>
               <div className="flex items-center gap-2">
                 <h3 className="font-black text-[#002147] uppercase text-sm tracking-widest">{ann.title}</h3>
                 {ann.is_archived && (
                   <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">Arquivado</span>
                 )}
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Por {ann.author_name} em {new Date(ann.created_at).toLocaleDateString()}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 transition-colors"><X size={24} /></button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Conteúdo Principal */}
          <div className={`flex-1 overflow-y-auto p-10 space-y-6 ${showLogs ? 'md:w-1/2 md:border-r border-slate-100' : 'w-full'}`}>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-sm">{ann.content}</p>
            </div>

            {ann.attachment_url && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Documento Anexo</p>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-500 p-2 rounded-lg"><Download size={18} /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{ann.attachment_name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Clique para baixar</p>
                    </div>
                  </div>
                  <a 
                    href={`http://${window.location.hostname}:8000${ann.attachment_url}`} 
                    download={ann.attachment_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#002147] text-[#D4AF37] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex-shrink-0"
                  >
                    Baixar
                  </a>
                </div>
              </div>
            )}

            {/* Ações Inferiores */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
               {!ann.has_acknowledged && !ann.is_archived ? (
                 <button 
                  onClick={handleAcknowledge}
                  disabled={loading}
                  className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg"
                 >
                   {loading ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={18} /> Registrar Ciência</>}
                 </button>
               ) : !ann.is_archived && (
                 <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase bg-green-50 px-6 py-4 rounded-2xl border border-green-100">
                   <CheckCircle size={18} /> Ciência Confirmada
                 </div>
               )}

               {isManagement && (
                 <>
                   <button 
                    onClick={() => { setShowLogs(!showLogs); if(!showLogs) fetchLogs(); }}
                    className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all border ${showLogs ? 'bg-[#002147] text-white' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                   >
                     <History size={18} /> Auditoria
                   </button>
                   
                   <button 
                    onClick={handleToggleArchive}
                    disabled={loading}
                    className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all border ${
                      ann.is_archived 
                      ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' 
                      : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                    }`}
                   >
                     {loading ? <Loader2 className="animate-spin" size={18} /> : (
                       ann.is_archived ? <><RefreshCw size={18} /> Desarquivar</> : <><Archive size={18} /> Arquivar</>
                     )}
                   </button>
                 </>
               )}
            </div>
          </div>

          {/* Seção de Logs/Auditoria */}
          {showLogs && (
            <div className="flex-1 bg-slate-50/30 overflow-y-auto p-10 animate-in slide-in-from-right-4 duration-300">
               {loadingLogs ? (
                 <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#002147]" size={32} />
                 </div>
               ) : error ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <AlertCircle size={32} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    
                    {/* Coluna Pendentes */}
                    <div className="flex flex-col space-y-4">
                      <h4 className="font-black text-red-500 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                         <Clock size={14} /> Pendentes ({logs?.pending?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {logs?.pending?.map((p, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3 shadow-sm">
                             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 mt-1"><User size={14} /></div>
                             <div className="min-w-0">
                               {/* REMOVIDO 'truncate' PARA MOSTRAR NOME COMPLETO */}
                               <p className="text-[11px] font-black text-slate-700 leading-tight break-words">{p.name}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{p.dept}</p>
                             </div>
                          </div>
                        ))}
                        {logs?.pending && logs.pending.length === 0 && (
                          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <p className="text-slate-300 text-[10px] font-black uppercase">Todos já leram!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coluna Cientes */}
                    <div className="flex flex-col space-y-4">
                      <h4 className="font-black text-green-600 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                         <CheckCircle size={14} /> Confirmados ({logs?.acknowledged?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {logs?.acknowledged?.map((p, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-green-100 flex items-start gap-3 shadow-sm">
                             <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0 mt-1"><User size={14} /></div>
                             <div className="min-w-0">
                               {/* REMOVIDO 'truncate' PARA MOSTRAR NOME COMPLETO */}
                               <p className="text-[11px] font-black text-slate-700 leading-tight break-words">{p.name}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{p.dept}</p>
                             </div>
                          </div>
                        ))}
                        {logs?.acknowledged && logs.acknowledged.length === 0 && (
                          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <p className="text-slate-300 text-[10px] font-black uppercase">Ninguém confirmou ainda</p>
                          </div>
                        )}
                      </div>
                    </div>

                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};