/**
 * DOM Utility helpers for ArchProject 2026
 * These utilities help reduce boilerplate when selecting or creating elements
 */
const DOM = {
    get: (id) => document.getElementById(id),
    render: (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    },
    hide: (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    },
    show: (id, display = 'block') => {
        const el = document.getElementById(id);
        if (el) el.style.display = display;
    }
};

/**
 * Format currency in EUR
 * @param {number} amount - Value to format
 * @param {object} [options] - Optional formatting options
 * @returns {string} - Formatted string like "1.250,50 €"
 */
function formatCurrency(amount, options = {}) {
    const value = typeof amount === 'number' ? amount : 0;
    const compact = options.compact || false;
    
    if (compact && value >= 1000) {
        return (value / 1000).toFixed(1).replace('.', ',') + 'k €';
    }

    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: compact ? 0 : 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Update global navigation badges
 */
function updateBadges() {
    const pendencias = getAllPendencias ? getAllPendencias().filter(p => p.status === 'open').length : 0;
    const approvals = getAllPendingApprovals ? getAllPendingApprovals().length : 0;
    const total = pendencias + approvals;

    const el = document.getElementById('badgeTarefas');
    if (el) {
        if (total > 0) {
            el.textContent = total;
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    const c = DOM.get('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast show';
    t.textContent = message;
    c.appendChild(t);
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 500);
    }, 3000);
}

/**
 * Render a standardized stat card for dashboards
 * @param {string|number} value - Main number or value to display
 * @param {string} label - Primary label
 * @param {string} sublabel - Secondary context label
 * @param {string} page - Route to navigate to on click
 * @param {string} [highlightColor] - Optional hex color for the value text
 * @returns {string} - HTML string
 */
function renderStatCard(value, label, sublabel, page, highlightColor) {
    return `<div class="card card-clickable stat-card" onclick="navigate('${page}')">
        <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:12px;">
            <span class="stat-card__value" style="color:${highlightColor || '#111827'};">${value}</span>
        </div>
        <p class="stat-card__label">${label}</p>
        <p class="stat-card__sublabel">${sublabel}</p>
    </div>`;
}

/**
 * Add days to an ISO date string
 * @param {string} isoString - ISO date string
 * @param {number} days - Number of days to add
 * @returns {string} - New ISO date string
 */
function addDays(isoString, days) {
    const d = new Date(isoString);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

/**
 * Get person name by ID from the global TEAM object
 * @param {string} id - Person's ID
 * @returns {string} - Person's full name or "Desconhecido"
 */
function getPersonName(id) {
    if (!id) return '—';
    const member = TEAM.members.find(m => m.id === id);
    if (member) return member.name;
    const external = TEAM.externals.find(e => e.id === id);
    if (external) return external.name;
    const client = TEAM.clients.find(c => c.id === id);
    if (client) return client.name;
    return 'Desconhecido';
}

/**
 * Get all team member options as HTML
 * @param {string} [selectedId] - Optional selected member ID
 * @returns {string} - HTML option elements
 */
function getAllTeamOptions(selectedId) {
    let h = '';
    TEAM.members.forEach(m => { h += `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${m.name}</option>`; });
    TEAM.externals.forEach(e => { h += `<option value="${e.id}" ${e.id === selectedId ? 'selected' : ''}>${e.name} (${e.specialty})</option>`; });
    return h;
}

/**
 * Get initials from a person's name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
function getInitials(name) {
    if (!name) return '';
    const clean = name.replace(/^(Arq\.|Eng\.|Topógrafo)\s+/, '');
    const parts = clean.split(' ').filter(p => p.length > 0);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format duration in hours to human-readable format
 * @param {number} hours - Duration in hours (decimal)
 * @returns {string} - Formatted string like "2h 30m"
 */
function formatDurationHours(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
}

/**
 * Sanitize user input to prevent HTML injection
 * @param {string} text - User input string
 * @returns {string} - Escaped HTML-safe string
 */
function esc(text) {
    if (!text && text !== 0) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Check if the application is in full display mode
 * @returns {boolean} - True if mode is 'full'
 */
function isFullMode() {
    return APP.displayMode === 'full';
}

/**
 * Global function to open the standard modal
 * @param {string} title - Modal title
 * @param {string} bodyHtml - Modal body content (HTML)
 * @param {string} footerHtml - Modal footer content (HTML)
 */
function openModal(title, bodyHtml, footerHtml) {
    const modal = DOM.get('modalOverlay');
    if (!modal) return;
    
    DOM.render('modalTitle', title);
    DOM.render('modalBody', bodyHtml);
    DOM.render('modalFooter', footerHtml);
    
    modal.classList.add('open');
    
    // Auto-setup validation for any inputs in the modal
    setTimeout(() => setupFormValidation('modalBody'), 100);
}

/**
 * Close the standard modal
 */
function closeModal() {
    const modal = DOM.get('modalOverlay');
    if (modal) modal.classList.remove('open');
}

/**
 * Setup real-time validation for form
 * @param {string|HTMLElement} container - Container element or ID (optional)
 */
function setupFormValidation(container) {
    const el = typeof container === 'string' ? DOM.get(container) : (container || DOM.get('modalBody'));
    if (!el) return;
    
    el.querySelectorAll('.form-input').forEach(input => {
        if (input.dataset.vSetup) return;
        input.dataset.vSetup = "true";
        
        // Real-time validation on blur
        input.addEventListener('blur', () => validateField(input));
        
        // Clear error on input
        input.addEventListener('input', () => {
            if (input.classList.contains('form-input-error')) {
                input.classList.remove('form-input-error');
                const error = input.parentNode.querySelector('.form-error');
                if (error) error.remove();
            }
        });
    });
}

/**
 * Helper to validate a specific input field
 * @param {HTMLElement} input - Input element
 * @returns {boolean} - True if field is valid
 */
function validateField(input) {
    if (!input.required && !input.value.trim()) return true;
    
    let isValid = true;
    let errorMsg = 'Campo obrigatório';
    
    if (input.required && !input.value.trim()) {
        isValid = false;
    } else if (input.type === 'email' && input.value.trim()) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(input.value.trim())) {
            isValid = false;
            errorMsg = 'Email inválido';
        }
    }
    
    if (!isValid) {
        input.classList.add('form-input-error');
        if (!input.parentNode.querySelector('.form-error')) {
            const errEl = document.createElement('div');
            errEl.className = 'form-error';
            errEl.textContent = errorMsg;
            input.parentNode.appendChild(errEl);
        }
    } else {
        input.classList.remove('form-input-error');
        const errEl = input.parentNode.querySelector('.form-error');
        if (errEl) errEl.remove();
    }
    
    return isValid;
}