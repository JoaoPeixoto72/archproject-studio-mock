function renderProject() {
    const proj = getProject(UI_STATE.currentProjectId);
    if (!proj) {
        document.getElementById('pageContent').innerHTML = `
            <div class="page-header"><h2>Projecto não encontrado</h2></div>
            <div class="page-body"><button class="btn btn-secondary" onclick="navigate('projectos')">Voltar</button></div>
        `;
        return;
    }

    const client = TEAM.clients.find(c => c.id === proj.client);
    const currentPhase = proj.phases.find(ph => ph.key === proj.currentPhaseKey);
    const progress = getProjectProgress(proj.id);

    // Tab guard: redirect if tab is not available in current mode
    if (!isFullMode()) {
        if (UI_STATE.currentProjectTab === 'mensagens') UI_STATE.currentProjectTab = 'pendencias';
        if (UI_STATE.currentProjectTab === 'tempo') UI_STATE.currentProjectTab = 'financeiro';
    }

    const tabs = isFullMode() ? [
        { key: 'visao-geral', label: 'Visão Geral' },
        { key: 'equipa', label: 'Equipa', count: (proj.team.members.length + proj.team.externals.length + proj.team.clients.length) },
        { key: 'fases', label: 'Fases e Entregáveis', count: proj.phases.length },
        { key: 'mensagens', label: 'Comunicação' },
        { key: 'documentos', label: 'Documentos' },
        { key: 'obra', label: 'Obra e Visitas', count: proj.visits.length },
        { key: 'financeiro', label: 'Financeiro' },
        { key: 'tempo', label: 'Estatísticas' },
        { key: 'pendencias', label: 'Pendências', count: proj.pendencias.filter(p => p.status === 'open').length }
    ] : [
        { key: 'visao-geral', label: 'Visão Geral' },
        { key: 'equipa', label: 'Equipa', count: (proj.team.members.length + proj.team.externals.length + proj.team.clients.length) },
        { key: 'fases', label: 'Fases e Entregáveis', count: proj.phases.length },
        { key: 'documentos', label: 'Documentos' },
        { key: 'obra', label: 'Obra e Visitas', count: proj.visits.length },
        { key: 'financeiro', label: 'Financeiro e Tempo' },
        { key: 'pendencias', label: 'Pendências e Comunicação', count: proj.pendencias.filter(p => p.status === 'open').length }
    ];

    let html = `
        <div class="content-container">
            <!-- Project header -->
            <div class="page-header" style="padding-bottom:0; border-bottom:none;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <button class="btn btn-secondary btn-sm" onclick="navigate('projectos')" style="padding:4px 8px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span style="font-size:12px; color:#9a928a;">Projectos</span>
                <span style="font-size:12px; color:#ccc;">›</span>
                <span style="font-size:12px; font-weight:600;">${esc(proj.name)}</span>
            </div>
            <div style="display:flex; align-items:flex-start; justify-content:space-between;">
                <div>
                    <h2 style="margin-bottom:6px;">${esc(proj.name)}</h2>
                    <div style="display:flex; align-items:center; gap:14px; font-size:12px; color:#7a736b; flex-wrap:wrap;">
                        <span>${esc(proj.location)}</span>
                        <span>·</span>
                        <span>${esc(proj.typology)}</span>
                        <span>·</span>
                        <span>${proj.area ? `${proj.area} m²` : esc(proj.area)}</span>
                        ${client ? `<span>·</span><span>Cliente: ${esc(client.name)}</span>` : ''}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="badge ${getStatusColor(proj.status)}" style="font-size:12px; padding:4px 12px;">${getStatusLabel(proj.status)}</span>
                    <div style="text-align:right;">
                        <span style="font-size:20px; font-weight:700;">${progress}%</span>
                        <div class="progress-bar" style="width:80px; margin-top:4px;">
                            <div class="progress-fill" style="width:${progress}%; background:#1a1714;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
    `;


    tabs.forEach(tab => {
        const isActive = UI_STATE.currentProjectTab === tab.key;
        html += `
            <button class="tab-btn ${isActive ? 'active' : ''}"
                    onclick="navigate('projecto',{id:'${proj.id}',tab:'${tab.key}'})">
                ${tab.label}
                ${tab.count !== undefined && tab.count > 0 ? `<span class="tab-count">${tab.count}</span>` : ''}
            </button>
        `;
    });

    html += `</div><div class="page-body">`;

    // Render active tab
    switch (UI_STATE.currentProjectTab) {
        case 'visao-geral': html += renderProjectOverview(proj); break;
        case 'equipa': html += renderProjectTeamTab(proj); break;
        case 'fases': html += renderProjectPhases(proj); break;
        case 'mensagens':
            if (isFullMode()) {
                html += renderProjectMessages(proj);
            } else {
                html += renderProjectPendencias(proj);
                html += '<div style="margin:48px 0; border-top:2px solid #e5e7eb;"></div>';
                html += renderProjectMessages(proj);
            }
            break;
        case 'documentos': html += renderProjectDocuments(proj); break;
        case 'obra': html += renderProjectVisits(proj); break;
        case 'financeiro':
            html += renderProjectFinancials(proj);
            if (!isFullMode()) {
                html += '<div style="margin:48px 0; border-top:2px solid #e5e7eb;"></div>';
                html += renderProjectTime(proj);
            }
            break;
        case 'tempo':
            if (isFullMode()) {
                html += renderProjectTime(proj);
            } else {
                html += renderProjectFinancials(proj);
                html += '<div style="margin:48px 0; border-top:2px solid #e5e7eb;"></div>';
                html += renderProjectTime(proj);
            }
            break;
        case 'pendencias':
            html += renderProjectPendencias(proj);
            if (!isFullMode()) {
                html += '<div style="margin:48px 0; border-top:2px solid #e5e7eb;"></div>';
                html += renderProjectMessages(proj);
            }
            break;
        default: html += renderProjectOverview(proj);
    }

    html += `</div></div>`;
    document.getElementById('pageContent').innerHTML = html;

    // Auto-expand removed due to simplified phases layout
}

// ============================================================================
// TAB 1: VISÃO GERAL
// ============================================================================

