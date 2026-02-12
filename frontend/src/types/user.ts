/**
 * CAMINHO: src/types/user.ts
 * Definições de tipos para o sistema ZeroCore.
 */
import { ReactNode } from 'react';

export interface UserData {
  id: string;
  name: string;
  role: string;
  dept: string;
  email: string;
}

export interface MenuItem {
  title: string;
  icon: ReactNode;
  roles: string[];
  path: string; // Caminho da URL para navegação
}