"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import EmployeeProfile from '@/modules/Employees/EmployeeProfile';

// Esta é a página que o Next.js chama quando alguém acessa /colaboradores/qualquer.nome
export default function DynamicProfilePage() {
  const params = useParams();
  const router = useRouter();
  
  // O 'username' vem diretamente da URL graças à pasta [username]
  const username = params.username as string;

  const handleBack = () => {
    router.push('/colaboradores');
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50/50 font-sans">
      <EmployeeProfile 
        username={username} 
        onBack={handleBack} 
      />
    </div>
  );
}