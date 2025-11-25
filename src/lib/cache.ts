// Cache simples em memória para dados que mudam pouco
// Para produção, considerar Redis ou similar

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // TTL padrão: 5 minutos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verificar se expirou
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  deletePattern(pattern: string): void {
    // Deletar todas as chaves que começam com o padrão
    const regex = new RegExp(`^${pattern.replace('*', '.*')}`);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar itens expirados periodicamente (opcional)
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Instância global do cache
export const cache = new MemoryCache();

// Limpar cache expirado a cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

// Funções auxiliares para criar chaves de cache
export function cacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export const CacheKeys = {
  services: (enterpriseId: string) => cacheKey('services', enterpriseId),
  service: (enterpriseId: string, serviceId: string) =>
    cacheKey('service', enterpriseId, serviceId),
  clients: (enterpriseId: string, page?: number, limit?: number, search?: string) =>
    cacheKey('clients', enterpriseId, page || 1, limit || 20, search || ''),
  client: (enterpriseId: string, clientId: string) =>
    cacheKey('client', enterpriseId, clientId),
};

