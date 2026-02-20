/**
 * Wrapper para requisições API via Proxy do Next.js.
 */
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = `/api`;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !('Content-Type' in headers)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Essencial para Cookies
    });

    // 👇 A MÁGICA ACONTECE AQUI 👇
    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        
        // 1. Pede silenciosamente pro backend destruir o cookie
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          console.error("Erro ao limpar cookie no backend", e);
        }

        // 2. Agora sim, com o cookie apagado, redireciona pro login!
        window.location.href = '/login';
      }
      return Promise.reject(new Error("Sessão Expirada"));
    }

    return response;
  } catch (error) {
    console.error("Erro na API:", error);
    throw error;
  }
};