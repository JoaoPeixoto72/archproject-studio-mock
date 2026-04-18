// ============================================================================
// ArchProject — app.js
// Controlador principal: Router e Inicialização
// ============================================================================

// ── State ──
// Todas as variáveis de estado global estão em core/state.js (UI_STATE)


// ===================================
// INIT
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadPersistedData();
    PROJECTS.forEach(p => refreshPhaseStatuses(p.id));
    if (typeof QuotesModule !== 'undefined') await QuotesModule.init();
    updateBadges();
    window.addEventListener('hashchange', handleRoute);
    startTimerTick();
    handleRoute();
});

async function loadPersistedData() {
    const savedProjects = await DB.getAll('projects');
    if (savedProjects.length > 0) {
        PROJECTS.length = 0;
        savedProjects.forEach(p => PROJECTS.push(p));
    }

    const savedTeam = await DB.get('config', 'team');
    if (savedTeam) {
        const data = savedTeam.value || savedTeam;
        if (data.members) {
            const clean = { ...data };
            delete clean.id; // Evitar poluição com o ID da BD
            Object.assign(TEAM, clean);
        }
    }

    const savedTemplates = await DB.getAll('templates');
    if (savedTemplates.length > 0) {
        TEMPLATES.length = 0;
        savedTemplates.forEach(t => TEMPLATES.push(t));
    }

    const savedSettings = await DB.get('config', 'settings');
    if (savedSettings) {
        const data = savedSettings.value || savedSettings;
        if (data.internalRoles) Object.assign(SETTINGS, data);
    }

    const savedApp = await DB.get('config', 'app');
    if (savedApp) {
        const data = savedApp.value || savedApp;
        if (data.office) Object.assign(APP.office, data.office);
        if (data.displayMode) APP.displayMode = data.displayMode;
    }
}

async function persistAll() {
    await DB.saveAll('projects', PROJECTS);
    await DB.saveAll('templates', TEMPLATES);
    await DB.put('config', { id: 'team', value: TEAM });
    await DB.put('config', { id: 'settings', value: SETTINGS });
    await DB.put('config', { id: 'app', value: { office: APP.office, displayMode: APP.displayMode } });
}

// ============================================================================
// ROUTER
// ============================================================================

function navigate(page, params) {
    let hash = '#' + page;
    if (params) {
        // Enforce specific order for project route: #projecto/id/tab/phase
        if (page === 'projecto') {
            hash += '/' + (params.id || '');
            hash += '/' + (params.tab || 'visao-geral');
            if (params.phase) hash += '/' + params.phase;
        } else {
            hash += '/' + Object.values(params).join('/');
        }
    }
    window.location.hash = hash;
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'painel';
    const parts = hash.split('/');
    const page = parts[0];

    // Limpeza de UI Global
    if (!page.startsWith('portal-')) {
        APP.portalMode = null;
        const banner = document.getElementById('portalBanner');
        if (banner) banner.classList.remove('visible');
    }

    // Sidebar active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) btn.classList.add('active');
    });

    UI_STATE.currentPage = page;

    switch (page) {
        case 'painel':
            renderDashboard();
            break;
        case 'calendario':
            renderCalendario();
            break;
        case 'projectos':
            renderAllProjects();
            break;
        case 'projecto':
            UI_STATE.currentProjectId = parts[1] || null;
            UI_STATE.currentProjectTab = parts[2] || 'visao-geral';
            UI_STATE.currentPhaseKey = parts[3] || null;
            renderProject();
            break;
        case 'geral-tarefas':
            renderGeralTarefas();
            break;
        case 'geral-tempo':
            renderGeralTempo();
            break;
        case 'geral-actividade':
            renderGeralActividade();
            break;
        case 'templates':
            renderTemplates();
            break;
        case 'template':
            renderTemplateEdit(parts[1]);
            break;
        case 'equipa':
            renderEquipa();
            break;
        case 'configuracoes':
            renderConfiguracoes();
            break;
        case 'portal-cliente':
            renderPortalCliente(parts[1]);
            break;
        case 'portal-externo':
            renderPortalExterno(parts[1]);
            break;
        case 'orcamentos':
            if (parts[1] && QuotesModule._list && QuotesModule._list.some(q => q.id === parts[1])) {
                QuotesModule.open(parts[1]);
            } else {
                QuotesModule.render();
            }
            break;
        default:
            document.getElementById('pageContent').innerHTML = `
                <div class="content-container">
                    <div class="page-header"><h2>Em Construção</h2></div>
                </div>
            `;
    }

    // Scroll Fix
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.scrollTop = 0;
    window.scrollTo(0, 0);
}

// ============================================================================
// TIMER GLOBAL LOGIC
// ============================================================================

function startTimerTick() {
    if (UI_STATE.timer.interval) return;
    UI_STATE.timer.interval = setInterval(() => {
        const display = document.getElementById('timerDisplay');
        if (!display || !UI_STATE.timer.running || !UI_STATE.timer.startTime) return;
        
        const elapsed = Math.floor((Date.now() - UI_STATE.timer.startTime) / 1000) + UI_STATE.timer.elapsed;
        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        display.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

function startTimer(projectId, phaseKey, description) {
    UI_STATE.timer.running = true;
    UI_STATE.timer.projectId = projectId;
    UI_STATE.timer.phaseKey = phaseKey;
    UI_STATE.timer.startTime = Date.now();
    UI_STATE.timer.elapsed = 0;
    UI_STATE.timer.description = description || '';

    const proj = getProject(projectId);
    const phase = getPhase(projectId, phaseKey);
    const projLabel = document.getElementById('timerProject');
    const phaseLabel = document.getElementById('timerPhase');
    if (projLabel) projLabel.textContent = proj ? proj.name : '—';
    if (phaseLabel) phaseLabel.textContent = phase ? phase.abbr + ' — ' + phase.name : '—';
    
    const bar = document.getElementById('timerBar');
    if (bar) bar.classList.add('running');

    showToast('Cronómetro iniciado');
}

function stopTimer() {
    if (!UI_STATE.timer.running && UI_STATE.timer.elapsed === 0) return;

    // Se estava pausado, calcular elapsed já guardado
    const elapsed = UI_STATE.timer.running
        ? Math.floor((Date.now() - UI_STATE.timer.startTime) / 1000) + UI_STATE.timer.elapsed
        : UI_STATE.timer.elapsed;
    const hours = Math.round((elapsed / 3600) * 100) / 100;

    if (hours >= 0.01) {
        const proj = getProject(UI_STATE.timer.projectId);
        if (proj) {
            addTimeLog(UI_STATE.timer.projectId, {
                date: todayStr(),
                hours: hours,
                phase: UI_STATE.timer.phaseKey,
                description: UI_STATE.timer.description || 'Tempo registado por cronómetro',
                billable: true
            });
            showToast(`Registadas ${hours.toFixed(1)}h no projecto ${proj.name}`);
        }
    }

    UI_STATE.timer.running = false;
    UI_STATE.timer.elapsed = 0;
    UI_STATE.timer.startTime = null;
    const bar = document.getElementById('timerBar');
    if (bar) bar.classList.remove('running');
    
    const display = document.getElementById('timerDisplay');
    if (display) display.textContent = '00:00:00';

    const pauseBtn = document.getElementById('timerPauseBtn');
    if (pauseBtn) pauseBtn.textContent = 'Pausar';

    updateBadges();
    handleRoute();
}

function pauseTimer() {
    const pauseBtn = document.getElementById('timerPauseBtn');
    if (UI_STATE.timer.running) {
        // Pausar: guardar elapsed acumulado
        UI_STATE.timer.elapsed = Math.floor((Date.now() - UI_STATE.timer.startTime) / 1000) + UI_STATE.timer.elapsed;
        UI_STATE.timer.running = false;
        UI_STATE.timer.startTime = null;
        if (pauseBtn) pauseBtn.textContent = 'Retomar';
        showToast('Cronómetro pausado');
    } else if (UI_STATE.timer.elapsed > 0) {
        // Retomar
        UI_STATE.timer.running = true;
        UI_STATE.timer.startTime = Date.now();
        if (pauseBtn) pauseBtn.textContent = 'Pausar';
        showToast('Cronómetro retomado');
    }
}

function enterPortal(mode, id) {
    if (mode === 'client') {
        navigate('portal-cliente', id ? { id: id } : {});
    } else {
        navigate('portal-externo', id ? { id: id } : {});
    }
}

function exitPortal() {
    APP.portalMode = null;
    const banner = document.getElementById('portalBanner');
    if (banner) banner.classList.remove('visible');
    navigate('painel');
}

// ── Global Search ──
function globalSearch(query) {
    const container = document.getElementById('searchResults');
    if (!query || query.trim().length === 0) {
        container.style.display = 'none';
        if (_searchOutsideHandler) {
            document.removeEventListener('click', _searchOutsideHandler);
            _searchOutsideHandler = null;
        }
        return;
    }
    
    const q = query.toLowerCase().trim();
    const results = [];
    
    // Projectos
    PROJECTS.forEach(p => {
        if (p.name.toLowerCase().includes(q) || (p.location && p.location.toLowerCase().includes(q))) {
            results.push({ type: 'Projecto', name: p.name, id: p.id, route: 'projecto' });
        }
    });
    
    // Orçamentos
    if (typeof QuotesModule !== 'undefined' && QuotesModule._list) {
        QuotesModule._list.forEach(orc => {
            if (orc.reference.toLowerCase().includes(q) || orc.client.name.toLowerCase().includes(q) || (orc.brief && orc.brief.projectName && orc.brief.projectName.toLowerCase().includes(q))) {
                results.push({ type: 'Orçamento', name: orc.reference + ' - ' + orc.client.name, id: orc.id, route: 'orcamentos' });
            }
        });
    }

    // Clientes (Simulado a partir de projectos e orçamentos)
    const clients = new Set();
    PROJECTS.forEach(p => {
        const client = TEAM.clients.find(c => c.id === p.client);
        if (client && client.name.toLowerCase().includes(q)) {
            clients.add(client.name);
        }
    });
    if (typeof QuotesModule !== 'undefined' && QuotesModule._list) {
        QuotesModule._list.forEach(orc => { if (orc.client && orc.client.name.toLowerCase().includes(q)) clients.add(orc.client.name); });
    }

    clients.forEach(c => {
        results.push({ type: 'Cliente', name: c, id: null, route: 'projectos' });
    });

    if (results.length === 0) {
        container.innerHTML = '<div style="padding:15px; font-size:12px; color:#9ca3af; text-align:center;">Nenhum resultado encontrado</div>';
    } else {
        container.innerHTML = results.slice(0, 8).map(r => `
            <div class="search-result-item" 
                 onclick="navigate('${r.route}', ${r.id ? `{id:'${r.id}'}` : '{}'})">
                <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#9ca3af; letter-spacing:0.5px; margin-bottom:2px;">${r.type}</div>
                <div style="font-size:13px; color:#fff; font-weight:500;">${r.name}</div>
            </div>
        `).join('');
    }
    container.style.display = 'block';

    // Fechar ao clicar fora
    if (_searchOutsideHandler) {
        document.removeEventListener('click', _searchOutsideHandler);
    }
    _searchOutsideHandler = (e) => {
        if (!container.contains(e.target)) {
            container.style.display = 'none';
            document.removeEventListener('click', _searchOutsideHandler);
            _searchOutsideHandler = null;
        }
    };
    setTimeout(() => document.addEventListener('click', _searchOutsideHandler), 10);
}
