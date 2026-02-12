/**
 * CAMINHO: src/app/page.tsx
 * Gerencia o redirecionamento inicial ao acessar o domínio raiz.
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('zc_token');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}