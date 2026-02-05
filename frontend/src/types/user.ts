import React from 'react';

export interface UserData {
  name: string;
  role: string;
  departments: string[]; // Grupos ZC_DEPT_ limpos vindos do AD
  location?: string;
  username: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECH' | 'OPS_MGMT' | 'STRAT_MGMT' | 'SECTOR';
  target_dept?: string;
  created_at: string;
  author_name?: string;
}

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  roles: string[];
  module: string;
}