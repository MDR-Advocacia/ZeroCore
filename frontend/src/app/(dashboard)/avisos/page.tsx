/**
 * CAMINHO: src/app/(dashboard)/avisos/page.tsx
 * Conteúdo da rota /avisos.
 */
"use client";
import React, { useEffect, useState } from 'react';
import { MuralModule } from '@/modules/Announcements/MuralModule';
import { UserData } from '@/types/user';

export default function AvisosPage() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('zc_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return <MuralModule user={user} />;
}