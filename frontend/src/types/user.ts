export interface UserData {
  id?: string;
  username: string;
  name: string;
  email?: string;
  role: string;
  
  // Mudança aqui: backend agora manda lista de setores e permissões
  depts: string[]; 
  permissions: string[];
  
  location?: string;
  title?: string;
  token?: string; // Usado para armazenar o JWT
}

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  roles: string[];
  module: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECH' | 'OPS_MGMT' | 'STRAT_MGMT' | 'SECTOR';
  target_dept?: string;
  created_at: string;
  created_by?: string;
}