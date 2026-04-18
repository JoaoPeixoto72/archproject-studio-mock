// ============================================================================
// ArchProject — data/utils.js
// Helpers utilitários puros: IDs, datas, labels de estado e prioridade.
// Sem dependências de outros ficheiros.
// ============================================================================

function generateId(prefix = '') {
    const id = Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    return prefix ? prefix + '_' + id : id;
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function formatDate(isoString) {
    if (!isoString) return '—';
    const parts = isoString.split('-');
    if (parts.length < 3) return isoString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getStatusLabel(status) {
    const labels = {
        'draft': 'Rascunho',
        'active': 'Activo',
        'on-hold': 'Em Pausa',
        'completed': 'Concluído',
        'cancelled': 'Cancelado',
        'ready': 'Pronto',
        'pending': 'Pendente',
        'blocked': 'Bloqueado',
        'in-progress': 'Em Curso',
        'in-review': 'Em Revisão',
        'approved': 'Aprovado',
        'rejected': 'Rejeitado',
        'done': 'Concluído',
        'open': 'Aberto',
        'closed': 'Fechado'
    };
    return labels[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'done': 'bg-green-100 text-green-800',
        'approved': 'bg-green-100 text-green-800',
        'active': 'bg-blue-100 text-blue-800',
        'ready': 'bg-purple-100 text-purple-700',
        'in-progress': 'bg-blue-100 text-blue-800',
        'in-review': 'bg-yellow-100 text-yellow-800',
        'pending': 'bg-gray-100 text-gray-600',
        'blocked': 'bg-red-100 text-red-800',
        'rejected': 'bg-red-100 text-red-800',
        'draft': 'bg-gray-100 text-gray-500',
        'open': 'bg-orange-100 text-orange-800',
        'closed': 'bg-green-100 text-green-800',
        'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
}

function getDocStatusLabel(status) {
    const labels = {
        'draft': 'Rascunho',
        'in-review': 'Em Revisão',
        'shared': 'Partilhado',
        'approved': 'Aprovado',
        'obsolete': 'Obsoleto'
    };
    return labels[status] || status;
}

function getDocStatusColor(status) {
    const colors = {
        'draft': 'bg-gray-100 text-gray-600',
        'in-review': 'bg-yellow-100 text-yellow-800',
        'shared': 'bg-blue-100 text-blue-800',
        'approved': 'bg-green-100 text-green-800',
        'obsolete': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
}

function getPriorityLabel(priority) {
    const labels = { 'high': 'Alta', 'medium': 'Média', 'low': 'Baixa' };
    return labels[priority] || priority;
}

function getPriorityColor(priority) {
    const colors = { 'high': 'bg-red-100 text-red-700', 'medium': 'bg-yellow-100 text-yellow-700', 'low': 'bg-blue-100 text-blue-700' };
    return colors[priority] || 'bg-gray-100 text-gray-600';
}

function getApprovalTypeLabel(type) {
    const labels = {
        'client': 'Cliente',
        'technical': 'Técnica',
        'external': 'Externa'
    };
    return labels[type] || type;
}

function daysBetween(d1, d2) {
    if (!d1 || !d2) return 0;
    const t1 = new Date(d1).getTime();
    const t2 = new Date(d2).getTime();
    return Math.floor(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));
}

function getPendenciaUrgencyStyle(pend) {
    if (!pend.deadline || pend.status !== 'open') return {};
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(pend.deadline);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { bg: '#fef2f2', color: '#ef4444', text: 'Em atraso' };
    } else if (diffDays === 0) {
        return { bg: '#fffbeb', color: '#f59e0b', text: 'Termina hoje' };
    } else if (diffDays <= 2) {
        return { bg: '#fffbeb', color: '#f59e0b', text: `Termina em ${diffDays} dia${diffDays !== 1 ? 's' : ''}` };
    }
    return {};
}