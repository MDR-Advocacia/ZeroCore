/**
 * CAMINHO: src/app/(dashboard)/dashboard/page.tsx
 * * PAPEL DESTA PÁGINA:
 * Esta página funciona apenas como um "ponto de entrada" para a rota /dashboard.
 * A lógica real, o design e as funções continuam residindo em @/modules/Home/HomeModule.
 * * NOTA: Utilizamos caminhos relativos para garantir compatibilidade máxima
 * com o ambiente de build e visualização.
 */
"use client";

import React, { useEffect, useState } from 'react';
// Caminho relativo para garantir que o bundler encontre o módulo corretamente
import { HomeModule } from '../../../modules/Home/HomeModule';
import { UserData } from '../../../types/user';

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Recuperamos os dados do usuário para passar para o módulo.
    // O Layout já garantiu que estamos logados, aqui apenas pegamos os dados.
    const storedUser = localStorage.getItem('zc_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao processar dados do usuário:", error);
      }
    }
  }, []);

  // Renderizamos o módulo original. 
  // Qualquer alteração de design que você quiser fazer no Dashboard, 
  // deve ser feita dentro do arquivo do HomeModule.
  return <HomeModule user={user} />;
}