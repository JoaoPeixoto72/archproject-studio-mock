// ============================================================================
// ArchProject — persistence.js
// Camada de abstracção de persistência sobre localStorage
// Quando migrarmos para Hono + D1, só substituímos a implementação interna
// ============================================================================

const DB = {
    /**
     * Lê todos os itens de uma colecção
     */
    async getAll(collection) {
        try {
            const data = localStorage.getItem(`arch_${collection}`);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /**
     * Lê um item por ID
     */
    async get(collection, id) {
        const all = await this.getAll(collection);
        return all.find(x => x.id === id) || null;
    },

    /**
     * Cria ou actualiza um item na colecção
     */
    async put(collection, item) {
        try {
            const all = await this.getAll(collection);
            const idx = all.findIndex(x => x.id === item.id);
            if (idx >= 0) all[idx] = item;
            else all.push(item);
            localStorage.setItem(`arch_${collection}`, JSON.stringify(all));
            return item;
        } catch (e) {
            console.error(`DB.put(${collection}) failed:`, e);
            return null;
        }
    },

    /**
     * Guarda todos os itens de uma colecção (substitui tudo)
     */
    async saveAll(collection, items) {
        try {
            localStorage.setItem(`arch_${collection}`, JSON.stringify(items));
        } catch (e) {
            console.error(`DB.saveAll(${collection}) failed:`, e);
        }
    },
    async delete(collection, id) {
        try {
            let all = await this.getAll(collection);
            all = all.filter(x => x.id !== id);
            localStorage.setItem(`arch_${collection}`, JSON.stringify(all));
        } catch (e) {
            console.error(`DB.delete(${collection}) failed:`, e);
        }
    },

    /**
     * Limpa uma colecção inteira
     */
    async clear(collection) {
        localStorage.removeItem(`arch_${collection}`);
    }
};
