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

    if (response.status === 401) {
      localStorage.clear();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
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