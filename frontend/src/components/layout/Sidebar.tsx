// Caminho: ZeroCore/frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, LifeBuoy, Users, ShieldAlert, 
  Bell, BookOpen, Clock, LogOut, X, Menu, CreditCard, UserCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
}

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab, userRole, setUserRole }: SidebarProps) => {
  const menuGroups = [
    {
      label: "Operacional",
      roles: ['ADMIN', 'TECNICO', 'SUPERVISOR', 'USUARIO'],
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TECNICO', 'SUPERVISOR', 'USUARIO'] },
        { id: 'helpdesk', label: 'Helpdesk / Kanban', icon: LifeBuoy, roles: ['ADMIN', 'TECNICO', 'USUARIO'] },
      ]
    },
    {
      label: "Pessoas & RH",
      roles: ['ADMIN', 'SUPERVISOR', 'USUARIO'],
      items: [
        { id: 'meu-perfil', label: 'Meu Perfil & Docs', icon: UserCircle, roles: ['ADMIN', 'TECNICO', 'SUPERVISOR', 'USUARIO'] },
        { id: 'bonus', label: 'Bônus & Metas', icon: CreditCard, color: 'text-[#c5a059]', roles: ['ADMIN', 'TECNICO'] },
      ]
    }
  ];

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-20'} bg-[#0a1d37] transition-all duration-300 flex flex-col h-full shadow-2xl z-50`}>
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <div className={`flex items-center gap-3 ${!isOpen && 'hidden'}`}>
          <div className="w-8 h-8 bg-[#c5a059] rounded-md flex items-center justify-center font-bold text-[#0a1d37]">Z</div>
          <span className="text-xl font-bold text-white tracking-tighter">ZeroCore</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white/70 hover:text-white">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        {menuGroups.map((group, idx) => (
          group.roles.includes(userRole) && (
            <div key={idx} className="space-y-1">
              {isOpen && <p className="px-3 text-[10px] uppercase font-bold text-white/30 mb-2">{group.label}</p>}
              {group.items.map((item) => (
                item.roles.includes(userRole) && (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
                      ${activeTab === item.id ? 'bg-[#c5a059] text-[#0a1d37] font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <item.icon size={20} className={item.color || ""} />
                    {isOpen && <span className="text-sm truncate">{item.label}</span>}
                  </button>
                )
              ))}
            </div>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 p-3 text-white/40 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          {isOpen && <span className="text-sm">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;