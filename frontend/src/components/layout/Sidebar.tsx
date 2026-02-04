// Local: ZeroCore/frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, LifeBuoy, UserCircle, CreditCard, 
  Bell, BookOpen, Clock, LogOut, X, Menu 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'helpdesk', label: 'Helpdesk', icon: LifeBuoy },
    { id: 'bonus', label: 'Bônus TI', icon: CreditCard },
    { id: 'wiki', label: 'Wiki Saber', icon: BookOpen },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-[#0a1d37] transition-all duration-300 flex flex-col h-screen text-white shadow-xl`}>
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <span className={`font-bold text-xl ${!isOpen && 'hidden'}`}>Zero<span className="text-[#c5a059]">Core</span></span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-white/10 rounded">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors
              ${activeTab === item.id ? 'bg-[#c5a059] text-[#0a1d37]' : 'hover:bg-white/5'}
            `}
          >
            <item.icon size={22} />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-4 p-3 w-full text-white/50 hover:text-red-400 transition-colors">
          <LogOut size={22} />
          {isOpen && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;