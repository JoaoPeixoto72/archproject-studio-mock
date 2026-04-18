// ============================================================================
// ArchProject — core/constants.js
// Design system constants, color palette, typography, spacing, and status styles
// [REFACTOR] Consolidated from repeated inline values across 20+ files
// ============================================================================

/**
 * Color palette for the entire application
 * Organized by semantic meaning: text, backgrounds, status, borders
 * [REFACTOR] Extracted from hardcoded values in dashboard.js, portal.js, templates.js, etc.
 */
const COLOR_PALETTE = {
    text: {
        primary: '#111827',      // Main text color
        secondary: '#6b7280',    // Secondary/muted text
        tertiary: '#9ca3af',     // Tertiary/disabled text
        light: '#1a1714'         // Light text (on dark backgrounds)
    },
    bg: {
        white: '#fff',           // Pure white
        light: '#f9fafb',        // Very light gray
        lighter: '#f3f4f6',      // Lighter gray
        muted: '#f0ece7'         // Muted beige
    },
    status: {
        done: '#10b981',         // Green - completed/approved
        active: '#f59e0b',       // Amber - in progress
        pending: '#d1d5db',      // Gray - pending
        error: '#ef4444',        // Red - error/rejected
        warning: '#d97706',      // Orange - warning/attention
        info: '#2563eb',         // Blue - info
        disabled: '#d1d5db'      // Gray - disabled
    },
    border: {
        light: '#f9fafb',        // Very light border
        default: '#eee',         // Default border
        dark: '#e5e7eb'          // Darker border
    }
};

/**
 * Status labels in Portuguese
 * [REFACTOR] Consolidated from multiple switch/if statements across project-*.js files
 */
const STATUS_LABELS = {
    // Phase/Deliverable statuses
    done: 'Concluído',
    active: 'Em Curso',
    'in-progress': 'Em Progresso',
    pending: 'Pendente',
    blocked: 'Bloqueado',
    ready: 'Pronta a Iniciar',
    
    // Approval statuses
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    
    // Payment statuses
    paid: 'Pago',
    unpaid: 'Não Pago',
    
    // Project statuses
    completed: 'Concluído',
    'on-hold': 'Suspenso',
    archived: 'Arquivado',
    
    // Quote statuses
    draft: 'Rascunho',
    sent: 'Enviado',
    accepted: 'Aceite',
    expired: 'Expirado'
};

/**
 * Status colors mapping
 * [REFACTOR] Consolidated from getStatusColor() and similar functions
 */
const STATUS_COLORS = {
    done: COLOR_PALETTE.status.done,
    active: COLOR_PALETTE.status.active,
    'in-progress': COLOR_PALETTE.status.active,
    pending: COLOR_PALETTE.status.pending,
    blocked: COLOR_PALETTE.status.error,
    ready: '#7c3aed',
    approved: COLOR_PALETTE.status.done,
    rejected: COLOR_PALETTE.status.error,
    paid: COLOR_PALETTE.status.done,
    unpaid: COLOR_PALETTE.status.warning,
    completed: COLOR_PALETTE.status.done,
    'on-hold': COLOR_PALETTE.status.warning,
    archived: COLOR_PALETTE.status.pending,
    draft: COLOR_PALETTE.status.pending,
    sent: COLOR_PALETTE.status.info,
    accepted: COLOR_PALETTE.status.done,
    expired: COLOR_PALETTE.status.error
};

/**
 * Typography/Font sizes
 * [REFACTOR] Extracted from hardcoded values like 32px, 42px, 16px, etc.
 */
const FONT_SIZES = {
    xs: '10px',
    sm: '11px',
    base: '12px',
    md: '13px',
    lg: '14px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '42px'
};

/**
 * Spacing scale (padding, margin, gaps)
 * [REFACTOR] Extracted from repeated inline values
 */
const SPACING = {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '40px',
    '6xl': '48px'
};

/**
 * Common layout patterns
 * [REFACTOR] Extracted from repeated grid-template-columns throughout files
 */
const LAYOUT_STYLES = {
    grid2Col: 'display:grid; grid-template-columns:1fr 1fr; gap:16px;',
    grid3Col: 'display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;',
    gridAuto: 'display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;',
    flexRow: 'display:flex; flex-direction:row; gap:16px;',
    flexCol: 'display:flex; flex-direction:column; gap:16px;',
    flexCenter: 'display:flex; align-items:center; justify-content:center;',
    flexBetween: 'display:flex; align-items:center; justify-content:space-between;'
};

/**
 * Card styling patterns
 * [REFACTOR] Extracted from repeated card styles in every file
 */
const CARD_STYLES = {
    default: 'background:#fff; border-radius:0; border:1px solid #eee; padding:24px;',
    compact: 'background:#fff; border-radius:0; border:1px solid #eee; padding:16px;',
    hover: 'border-color:#000;',
    clickable: 'cursor:pointer; transition:border-color 0.2s;'
};

/**
 * Table header styling
 * [REFACTOR] Extracted from repeated table header styles in project-*.js, equipa.js, geral.js
 */
const TABLE_HEADER_STYLE = 'padding:16px 24px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#111827; background:#f9fafb; border-bottom:1px solid #eee;';

/**
 * Table cell styling
 * [REFACTOR] Extracted from repeated table cell styles
 */
const TABLE_CELL_STYLE = 'padding:16px 24px; font-size:13px; color:#6b7280; font-weight:500; border-bottom:1px solid #f3f4f6;';

/**
 * Badge/Status label styling
 * [REFACTOR] Extracted from repeated badge styles
 */
const BADGE_STYLES = {
    default: 'font-size:10px; font-weight:700; background:#e5e7eb; color:#374151; border-radius:0; padding:4px 8px;',
    success: 'font-size:10px; font-weight:700; background:#d1fae5; color:#065f46; border-radius:0; padding:4px 8px;',
    warning: 'font-size:10px; font-weight:700; background:#fef3c7; color:#92400e; border-radius:0; padding:4px 8px;',
    error: 'font-size:10px; font-weight:700; background:#fee2e2; color:#991b1b; border-radius:0; padding:4px 8px;'
};

/**
 * Common messages and labels
 * [REFACTOR] Extracted from hardcoded strings in dashboard.js, portal.js, etc.
 */
const MESSAGES = {
    greeting: 'Bom dia',
    noData: 'Sem dados disponíveis',
    loading: 'Carregando...',
    error: 'Erro ao carregar dados',
    success: 'Operação realizada com sucesso',
    confirm: 'Tem a certeza?',
    delete: 'Eliminar',
    cancel: 'Cancelar',
    save: 'Guardar',
    close: 'Fechar'
};

/**
 * Portal labels and sections
 * [REFACTOR] Extracted from portal.js hardcoded strings
 */
const PORTAL_LABELS = {
    clientPortal: 'Area de Cliente',
    externalPortal: 'Area de Colaborador',
    selectClient: 'Seleccione um cliente para visualizar a simulacao do portal.',
    selectExternal: 'Seleccione um colaborador para visualizar a simulacao do portal.',
    projectProgress: 'Acompanhe o progresso e comunique com a equipa do projecto.',
    owner: 'Proprietario',
    generalStatus: 'Estado Geral',
    nextPhase: 'Proxima Fase',
    budget: 'Orçamento',
    timeline: 'Cronograma'
};

/**
 * Responsive breakpoints (for CSS media queries)
 * [REFACTOR] Extracted from styles.css hardcoded values
 */
const BREAKPOINTS = {
    sm: '640px',
    md: '768px',
    lg: '900px',
    xl: '1024px',
    '2xl': '1280px'
};

/**
 * Animation/Transition timings
 * [REFACTOR] Extracted from repeated transition values
 */
const TRANSITIONS = {
    fast: '0.15s',
    base: '0.2s',
    slow: '0.3s'
};

/**
 * Helper function to get badge style based on status
 * [REFACTOR] Consolidates badge styling logic
 * @param {string} status - The status key
 * @returns {string} - The CSS style string
 */
function getBadgeStyle(status) {
    if (status === 'done' || status === 'approved' || status === 'paid' || status === 'accepted') {
        return BADGE_STYLES.success;
    } else if (status === 'pending' || status === 'draft' || status === 'sent') {
        return BADGE_STYLES.warning;
    } else if (status === 'rejected' || status === 'error' || status === 'expired') {
        return BADGE_STYLES.error;
    }
    return BADGE_STYLES.default;
}
