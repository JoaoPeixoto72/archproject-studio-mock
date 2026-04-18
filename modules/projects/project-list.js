// ============================================================================
// ArchProject — modules/projects/project-list.js
// Lista de projectos com filtros e ordenação
// ============================================================================

function filterProjectsList() {
    UI_STATE.projectList.search = document.getElementById('projectSearch')?.value || '';
    UI_STATE.projectList.status = document.getElementById('projectFilterStatus')?.value || '';
    renderAllProjects();
}

function setProjectSort(key) {
    if (UI_STATE.projectList.sortKey === key) {
        UI_STATE.projectList.sortDir = UI_STATE.projectList.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
        UI_STATE.projectList.sortKey = key;
        UI_STATE.projectList.sortDir = 'asc';
    }
    renderAllProjects();
}

function renderAllProjects() {
    // 1. Filter
    let filtered = PROJECTS.filter(p => {
        const client = TEAM.clients.find(c => c.id === p.client);
        const matchSearch = !UI_STATE.projectList.search ||
            p.name.toLowerCase().includes(UI_STATE.projectList.search.toLowerCase()) ||
            (client && client.name.toLowerCase().includes(UI_STATE.projectList.search.toLowerCase()));
        const matchStatus = !UI_STATE.projectList.status || p.status === UI_STATE.projectList.status;
        return matchSearch && matchStatus;
    });

    // 2. Sort
    filtered.sort((a, b) => {
        let valA, valB;
        switch (UI_STATE.projectList.sortKey) {
            case 'name': valA = a.name; valB = b.name; break;
            case 'client':
                const ca = TEAM.clients.find(c => c.id === a.client);
                const cb = TEAM.clients.find(c => c.id === b.client);
                valA = ca ? ca.name : ''; valB = cb ? cb.name : '';
                break;
            case 'status': valA = a.status; valB = b.status; break;
            case 'progress': valA = getProjectProgress(a.id); valB = getProjectProgress(b.id); break;
            case 'budget': valA = a.budget || 0; valB = b.budget || 0; break;
            case 'start': valA = a.createdAt; valB = b.createdAt; break;
            default: valA = a.name; valB = b.name;
        }
        if (valA < valB) return UI_STATE.projectList.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return UI_STATE.projectList.sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const active = PROJECTS.filter(p => p.status === 'active');

    let html = `
        <div class="content-container">
            <div class="page-header">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <h2 style="font-size:24px; font-weight:800; letter-spacing:-0.5px;">Projectos</h2>
                        <p style="font-size:13px; color:#6b7280; margin-top:4px;">${PROJECTS.length} projectos no total · ${active.length} activos em curso</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button class="btn btn-primary" onclick="openNewProjectModal()" style="border-radius:0;">+ Novo Projecto</button>
                        ${isFullMode() ? `
                            <div style="display:flex; gap:4px; border:1px solid #e5e7eb; padding:2px;">
                                <button onclick="UI_STATE.projectViewMode='list'; renderAllProjects();" style="padding:6px 14px; font-size:11px; font-weight:700; border:none; cursor:pointer; background:${UI_STATE.projectViewMode==='list'?'#111827':'transparent'}; color:${UI_STATE.projectViewMode==='list'?'#fff':'#6b7280'};">Lista</button>
                                <button onclick="UI_STATE.projectViewMode='kanban'; renderAllProjects();" style="padding:6px 14px; font-size:11px; font-weight:700; border:none; cursor:pointer; background:${UI_STATE.projectViewMode==='kanban'?'#111827':'transparent'}; color:${UI_STATE.projectViewMode==='kanban'?'#fff':'#6b7280'};">Kanban</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="page-body">

            <!-- Filter bar -->
            <div style="display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap;">
                <input type="text" class="form-input" id="projectSearch" placeholder="Pesquisar..." value="${esc(UI_STATE.projectList.search)}" style="max-width:260px; border-radius:0;" oninput="filterProjectsList()">
                <select class="form-input" id="projectFilterStatus" style="max-width:160px; border-radius:0;" onchange="filterProjectsList()">
                    <option value="">Todos os estados</option>
                    <option value="active" ${UI_STATE.projectList.status === 'active' ? 'selected' : ''}>Activos</option>
                    <option value="completed" ${UI_STATE.projectList.status === 'completed' ? 'selected' : ''}>Concluídos</option>
                    <option value="archived" ${UI_STATE.projectList.status === 'archived' ? 'selected' : ''}>Arquivados</option>
                </select>
            </div>
    `;

    if (isFullMode() && UI_STATE.projectViewMode === 'kanban') {
        const columns = [
            { key: 'active', label: 'Activos', color: '#2563eb' },
            { key: 'completed', label: 'Concluídos', color: '#16a34a' },
            { key: 'on-hold', label: 'Em Espera', color: '#d97706' },
            { key: 'archived', label: 'Arquivados', color: '#9ca3af' }
        ];
        html += `<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; align-items:start;">`;
        columns.forEach(col => {
            const colProjects = filtered.filter(p => p.status === col.key);
            html += `<div style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid ${col.color};">
                    <span style="font-size:11px; font-weight:800; text-transform:uppercase; color:${col.color}; letter-spacing:0.5px;">${col.label}</span>
                    <span style="font-size:11px; color:#9ca3af;">(${colProjects.length})</span>
                </div>
                ${colProjects.map(proj => {
                    const client = TEAM.clients.find(c => c.id === proj.client);
                    const progress = getProjectProgress(proj.id);
                    const health = getProjectHealth(proj.id);
                    const healthColor = health === 'green' ? '#16a34a' : health === 'yellow' ? '#d97706' : '#dc2626';
                    const activePhase = proj.phases.find(ph => ph.status === 'active');
                    return `<div class="card" style="padding:14px; margin-bottom:8px; cursor:pointer; border:1px solid #e5e7eb;" onclick="navigate('projecto',{id:'${proj.id}'})">
                        <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                            <div style="width:7px; height:7px; border-radius:50%; background:${healthColor}; flex-shrink:0;"></div>
                            <p style="font-size:13px; font-weight:700; margin:0; color:#111827; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(proj.name)}</p>
                        </div>
                        <p style="font-size:11px; color:#9ca3af; margin:0 0 8px;">${client ? esc(client.name) : '—'}</p>
                        ${activePhase ? `<p style="font-size:10px; color:#6b7280; margin:0 0 6px; font-weight:600;">${esc(activePhase.abbr)} — ${esc(activePhase.name)}</p>` : ''}
                        <div style="height:3px; background:#f3f4f6; position:relative;">
                            <div style="position:absolute; left:0; top:0; height:100%; width:${progress}%; background:#111827;"></div>
                        </div>
                        <p style="font-size:10px; color:#9ca3af; margin:4px 0 0; text-align:right;">${progress}%</p>
                    </div>`;
                }).join('') || `<p style="font-size:12px; color:#9ca3af; text-align:center; padding:16px;">Sem projectos</p>`}
            </div>`;
        });
        html += `</div>`;
        html += `</div></div>`;
        document.getElementById('pageContent').innerHTML = html;
        return;
    }

    // Projects table
    html += `
            <!-- Projects table -->
            <div class="card" style="border-radius:0; border-color:#eee; overflow-x: auto;">
                <table style="width:100%; border-collapse:collapse; font-size:12px; min-width: 900px;" id="projectsTable">
                    <thead>
                        <tr style="background:#fafafa; border-bottom:1px solid #eee;">
                            <th onclick="setProjectSort('name')" style="text-align:left; padding:16px 20px; font-weight:700; color:#111827; cursor:pointer; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Projecto ${UI_STATE.projectList.sortKey === 'name' ? (UI_STATE.projectList.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            <th onclick="setProjectSort('client')" style="text-align:left; padding:16px; font-weight:700; color:#111827; cursor:pointer; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Cliente ${UI_STATE.projectList.sortKey === 'client' ? (UI_STATE.projectList.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            <th onclick="setProjectSort('progress')" style="text-align:center; padding:16px; font-weight:700; color:#111827; cursor:pointer; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Progresso ${UI_STATE.projectList.sortKey === 'progress' ? (UI_STATE.projectList.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            <th onclick="setProjectSort('status')" style="text-align:center; padding:16px; font-weight:700; color:#111827; cursor:pointer; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Estado ${UI_STATE.projectList.sortKey === 'status' ? (UI_STATE.projectList.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            <th onclick="setProjectSort('start')" style="text-align:center; padding:16px; font-weight:700; color:#111827; cursor:pointer; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Início ${UI_STATE.projectList.sortKey === 'start' ? (UI_STATE.projectList.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            <th style="text-align:center; padding:16px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Data Prevista</th>
                            ${isFullMode() ? `<th style="text-align:center; padding:16px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Última Actividade</th>` : ''}
                            <th onclick="setProjectSort('budget')" style="text-align:right; padding:16px; font-weight:700; color:#111827; cursor:pointer; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Orçamento ${UI_STATE.projectList.sortKey === 'budget' ? (UI_STATE.projectList.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            <th style="text-align:center; padding:16px 20px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:1px; font-size:10px;">Equipa</th>
                        </tr>
                    </thead>
                    <tbody id="projectsTableBody">
    `;

    filtered.forEach(proj => {
        const client = TEAM.clients.find(c => c.id === proj.client);
        const progress = getProjectProgress(proj.id);
        const locParts = proj.location.split(' — ');
        const city = locParts.length > 1 ? locParts[1] : '';
        const address = locParts[0];
        const teamCount = (proj.team ? proj.team.members.length + proj.team.externals.length : 0);
        const health = getProjectHealth(proj.id);
        const healthColor = health === 'green' ? '#16a34a' : health === 'yellow' ? '#d97706' : '#dc2626';

        html += `
            <tr class="project-row" data-status="${proj.status}" data-name="${esc(proj.name).toLowerCase()}"
                style="border-bottom:1px solid #f9f9f9; cursor:pointer;"
                onclick="navigate('projecto',{id:'${proj.id}'})">
                <td style="padding:16px 20px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:8px; height:8px; border-radius:50%; background:${healthColor}; flex-shrink:0;"></div>
                        <p style="font-weight:700; margin:0; font-size:13px; color:#111827;">${esc(proj.name)}</p>
                    </div>
                    <p style="font-size:11px; color:#9ca3af; margin:2px 0 0; font-weight:500;">${city}${city ? ', ' : ''}${address}</p>
                </td>
                <td style="padding:16px;">
                    <p style="font-weight:600; margin:0; color:#4b5563;">${client ? esc(client.name) : '—'}</p>
                </td>
                <td style="padding:16px; text-align:center;">
                    <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
                        <div style="flex:1; max-width:60px; height:1px; background:#eee; position:relative;">
                            <div style="position:absolute; left:0; top:0; height:100%; width:${progress}%; background:#000;"></div>
                        </div>
                        <span style="font-size:11px; font-weight:700;">${progress}%</span>
                    </div>
                </td>
                <td style="padding:16px; text-align:center;">
                    <span class="badge ${getStatusColor(proj.status)}" style="font-weight:700; border-radius:0;">${getStatusLabel(proj.status)}</span>
                </td>
                <td style="padding:16px; text-align:center; color:#6b7280; font-weight:500;">${proj.createdAt || '—'}</td>
                <td style="padding:16px; text-align:center; color:#6b7280; font-weight:500;">${getProjectEndDate(proj)}</td>
                ${(() => {
                    if (!isFullMode()) return '';
                    const lastActivity = (proj.history || [])[0]?.date || null;
                    const today = todayStr();
                    let actColor = '#111827';
                    if (lastActivity) {
                        const daysAgo = daysBetween(lastActivity, today);
                        if (daysAgo > 30) actColor = '#dc2626';
                        else if (daysAgo > 14) actColor = '#d97706';
                    }
                    return `<td style="padding:16px; text-align:center; color:${actColor}; font-weight:500;">${lastActivity || '—'}</td>`;
                })()}
                <td style="padding:16px; text-align:right; font-weight:700; color:#111827;">${proj.budget ? proj.budget.toLocaleString('pt-PT') + '€' : '—'}</td>
                <td style="padding:16px 20px; text-align:center;">
                    <div style="display:flex; justify-content:center; align-items:center; isolation: isolate;">
                        ${renderTeamAvatars(proj.id)}
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('pageContent').innerHTML = html;
}

function renderTeamAvatars(projectId) {
    const proj = getProject(projectId);
    if (!proj || !proj.team) return '—';

    let members = [];
    proj.team.members.forEach(uid => {
        const user = TEAM.members.find(u => u.id === uid);
        if (user) members.push({ name: user.name, rank: user.role === 'admin' ? 1 : 2 });
    });
    proj.team.externals.forEach(eid => {
        const ext = TEAM.externals.find(e => e.id === eid);
        if (ext) members.push({ name: ext.name, rank: 3 });
    });
    proj.team.clients.forEach(cid => {
        const cl = TEAM.clients.find(c => c.id === cid);
        if (cl) members.push({ name: cl.name, rank: 4 });
    });

    members.sort((a, b) => a.rank - b.rank);
    const limit = 3;
    const toShow = members.slice(0, limit);
    const overflow = members.length - limit;
    const colors = [
        'background:#111827; color:#fff;',
        'background:#f3f4f6; color:#4b5563;',
        'background:#f5f5f5; color:#9ca3af;',
        'background:#fff; color:#111827; border:1px solid #eee;'
    ];

    let html = '';
    toShow.forEach((m, i) => {
        const style = colors[m.rank - 1] || colors[1];
        html += `<div style="width:24px; height:24px; border-radius:50%; ${style} display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; margin-left:${i === 0 ? 0 : -8}px; z-index:${10 - i}; box-shadow: 0 0 0 2px #fff;" title="${esc(m.name)}">${getInitials(m.name)}</div>`;
    });

    if (overflow > 0) {
        html += `<div style="width:24px; height:24px; border-radius:50%; background:#fafafa; color:#9ca3af; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; margin-left:-8px; z-index:0; box-shadow: 0 0 0 2px #fff; border:1px solid #eee;">+${overflow}</div>`;
    }
    return html;
}

function openNewProjectModal() {
    let templateOptions = TEMPLATES.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
    const body = `
        <div id="newProjectForm">
            <div class="form-group">
                <label class="form-label">Nome do Projecto</label>
                <input type="text" class="form-input" id="newProjName" placeholder="Ex: Moradia Santos" 
                       required data-field-name="Nome do projecto" data-min-length="2" data-max-length="100">
            </div>
            <div class="form-group">
                <label class="form-label">Template</label>
                <select class="form-input" id="newProjTemplate">
                    ${templateOptions}
                    <option value="">— Em branco —</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Localização</label>
                <input type="text" class="form-input" id="newProjLocation" placeholder="Morada do projecto" 
                       data-field-name="Localização" data-max-length="200">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group">
                    <label class="form-label">Tipologia</label>
                    <input type="text" class="form-input" id="newProjTypology" placeholder="Ex: Moradia T4" 
                           data-field-name="Tipologia" data-max-length="50">
                </div>
                <div class="form-group">
                    <label class="form-label">Área (m²)</label>
                    <input type="number" class="form-input" id="newProjArea" placeholder="200" 
                           min="0" max="99999" data-field-name="Área">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Orçamento de honorários (€)</label>
                <input type="number" class="form-input" id="newProjBudget" placeholder="50000" 
                       min="0" max="9999999" data-field-name="Orçamento">
            </div>
            <div style="margin-top:20px; padding-top:16px; border-top:1px solid #eee;">
                <p style="font-size:11px; font-weight:800; text-transform:uppercase; color:#9ca3af; margin-bottom:12px; letter-spacing:0.5px;">Equipa Inicial</p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    ${TEAM.members.map(m => `<label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer; padding:4px 0;"><input type="checkbox" name="initTeam" value="${m.id}" ${m.id === APP.currentUser.id ? 'checked disabled' : ''}><span>${esc(m.name)}</span></label>`).join('')}
                </div>
            </div>
        </div>
    `;
    const footer = `<button class="btn btn-primary" onclick="createProject()">Criar Projecto</button><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>`;
    openModal('Novo Projecto', body, footer);
    
    // Setup form validation
    setTimeout(() => setupFormValidation('newProjectForm'), 100);
}

function validateProjectForm() {
    const nameEl = document.getElementById('newProjName');
    const locationEl = document.getElementById('newProjLocation');
    
    let isValid = true;
    
    if (!nameEl || !nameEl.value.trim()) {
        showToast('O nome do projecto é obrigatório');
        if (nameEl) nameEl.classList.add('form-input-error');
        isValid = false;
    } else {
        nameEl.classList.remove('form-input-error');
    }

    if (!locationEl || !locationEl.value.trim()) {
        showToast('A localização é obrigatória');
        if (locationEl) locationEl.classList.add('form-input-error');
        isValid = false;
    } else {
        locationEl.classList.remove('form-input-error');
    }

    const templateId = document.getElementById('newProjTemplate')?.value;
    if (!templateId) {
        showToast('Deve seleccionar um template de projecto');
        isValid = false;
    }

    return isValid;
}

function createProject() {
    // Enhanced validation
    if (!validateProjectForm()) {
        return;
    }
    
    const name = document.getElementById('newProjName').value.trim();
    const templateId = document.getElementById('newProjTemplate').value;
    const template = TEMPLATES.find(t => t.id === templateId);
    const projId = generateId();

    let phases = [];
    if (template) phases = buildPhasesFromSource(template.phases);

    createNewProject({
        id: projId, name, client: null,
        location: document.getElementById('newProjLocation').value.trim(),
        typology: document.getElementById('newProjTypology').value.trim(),
        area: parseFloat(document.getElementById('newProjArea').value) || 0,
        budget: parseFloat(document.getElementById('newProjBudget').value) || 0,
        budgetSpent: 0, status: 'active',
        currentPhaseKey: phases.length > 0 ? phases[0].key : null,
        templateUsed: templateId || null,
        team: { members: Array.from(document.querySelectorAll('input[name="initTeam"]:checked')).map(cb => cb.value), externals: [], clients: [] },
        phases, visits: [], timeLogs: [], pendencias: [],
        historyDetail: name + (template ? ' a partir do template ' + template.name : ' em branco')
    });

    closeModal();
    showToast('Projecto "' + esc(name) + '" criado', 'success');
    updateBadges();
    navigate('projecto', { id: projId });
}

function getProjectEndDate(proj) {
    const phasesWithEnd = proj.phases.filter(ph => ph.endDate).sort((a, b) => b.order - a.order);
    return phasesWithEnd.length > 0 ? phasesWithEnd[0].endDate : '—';
}

