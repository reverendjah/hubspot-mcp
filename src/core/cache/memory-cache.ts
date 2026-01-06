/**
 * Interface para os dados armazenados no cache
 */
export interface ICacheData {
  customer: {
    id: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    birthDate: string;
    gender: string;
  };
  offers: Array<{
    id: string;
    title: string;
    description: string;
    bannerLink: string;
    menuLabel: string;
    order: number;
    storeId: string;
    storeCnpj: string;
  }>;
  placeName: string;
  offerType: string;
  timestamp: number;
}

/**
 * Singleton para cache em memória
 * Armazena até 20 registros usando o número do telefone como chave
 */
export class MemoryCache {
  private static instance: MemoryCache;
  private cache: Map<string, ICacheData>;
  private readonly maxSize: number = 20;

  private constructor() {
    this.cache = new Map();
  }

  /**
   * Retorna a instância única do cache
   */
  public static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  /**
   * Adiciona ou atualiza um registro no cache
   * @param phone - Número do telefone (chave)
   * @param data - Dados da oferta
   */
  public set(phone: string, data: Omit<ICacheData, "timestamp">): void {
    // Remove espaços e caracteres especiais do telefone para padronizar
    const cleanPhone = this.cleanPhone(phone);

    // Se o cache atingiu o limite máximo, remove o registro mais antigo
    if (this.cache.size >= this.maxSize && !this.cache.has(cleanPhone)) {
      this.removeOldest();
    }

    // Adiciona timestamp ao registro
    const cacheData: ICacheData = {
      ...data,
      timestamp: Date.now(),
    };

    this.cache.set(cleanPhone, cacheData);
  }

  /**
   * Recupera um registro do cache
   * @param phone - Número do telefone
   * @returns Dados do cache ou undefined se não encontrado
   */
  public get(phone: string): ICacheData | undefined {
    const cleanPhone = this.cleanPhone(phone);
    return this.cache.get(cleanPhone);
  }

  /**
   * Remove um registro do cache
   * @param phone - Número do telefone
   * @returns true se removido, false se não encontrado
   */
  public delete(phone: string): boolean {
    const cleanPhone = this.cleanPhone(phone);
    return this.cache.delete(cleanPhone);
  }

  /**
   * Verifica se existe um registro para o telefone
   * @param phone - Número do telefone
   * @returns true se existe, false caso contrário
   */
  public has(phone: string): boolean {
    const cleanPhone = this.cleanPhone(phone);
    return this.cache.has(cleanPhone);
  }

  /**
   * Retorna o número de registros no cache
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Limpa todo o cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Retorna todos os registros do cache
   */
  public getAll(): Map<string, ICacheData> {
    return new Map(this.cache);
  }

  /**
   * Remove o registro mais antigo do cache
   */
  private removeOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, data] of this.cache) {
      if (data.timestamp < oldestTimestamp) {
        oldestTimestamp = data.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Limpa e padroniza o número do telefone
   * @param phone - Número do telefone
   * @returns Telefone limpo (apenas números)
   */
  private cleanPhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }
}
