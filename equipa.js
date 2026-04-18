// ============================================================================
// ArchProject — equipa.js
// Gestão de Equipa, Clientes e Configurações
// ============================================================================

function renderEquipa() {
    let html = `
        <div class="content-container">
            <div class="page-header">
                <h2 style="font-size:32px; font-weight:800; letter-spacing:-1px;">Equipa e Clientes</h2>
                <p style="color:#6b7280; font-weight:500;">Gestão centralizada de recursos internos, parceiros externos e contactos de clientes.</p>
            </div>
            
            <div class="page-body">
                
                <!-- Equipa Interna -->
                <div style="margin-bottom:48px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#1a1714; margin:0;">Equipa Interna</h3>
                        <button class="btn btn-primary" style="padding:8px 20px; font-size:11px; font-weight:800;" onclick="openAddMemberModal('member')">+ Adicionar Membro</button>
                    </div>
                    <div class="card" style="padding:0; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="background:#f9fafb; border-bottom:1px solid #eee;">
                                <tr>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Colaborador</th>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Email</th>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Telefone</th>
                                    <th style="padding:12px 24px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Projectos</th>
                                    ${isFullMode() ? `
                                    <th style="padding:12px 24px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Horas/Semana</th>
                                    <th style="padding:12px 24px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Horas/Mês</th>
                                    ` : ''}
                                </tr>
                            </thead>
                            <tbody>
                                ${TEAM.members.map((m, i) => `
                                    <tr style="${i < TEAM.members.length - 1 ? 'border-bottom:1px solid #f9fafb;' : ''} cursor:pointer;" onclick="openAddMemberModal('member', '${m.id}')" class="hover-row">
                                        <td style="padding:16px 24px; display:flex; align-items:center; gap:16px;">
                                            <div class="avatar" style="width:36px; height:36px; border-radius:18px; font-size:11px; flex-shrink:0;">${getInitials(m.name)}</div>
                                            <div>
                                                <div style="font-size:14px; font-weight:700; color:#111827;">${esc(m.name)}</div>
                                                <div style="font-size:11px; color:#9ca3af; font-weight:500;">${esc(m.function || m.role)}</div>
                                            </div>
                                        </td>
                                        <td class="table-td">${esc(m.email)}</td>
                                        <td class="table-td">${esc(m.phone)}</td>
                                        <td style="padding:16px 24px; text-align:right; font-size:13px; color:#111827; font-weight:800;">${(m.projects || []).length}</td>
                                        ${isFullMode() ? (() => { const weekH = getMemberWeeklyHours(m.id); const monthH = getMemberMonthlyHours(m.id); const weekColor = weekH > 40 ? '#dc2626' : weekH < 20 ? '#9ca3af' : '#111827'; return `<td style="padding:16px 24px; text-align:right; font-size:13px; font-weight:700; color:${weekColor};">${weekH.toFixed(1)}h</td><td style="padding:16px 24px; text-align:right; font-size:13px; font-weight:700; color:#111827;">${monthH.toFixed(1)}h</td>`; })() : ''}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Colaboradores Externos -->
                <div style="margin-bottom:48px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#1a1714; margin:0;">Colaboradores Externos</h3>
                        <button class="btn btn-primary" style="padding:8px 20px; font-size:11px; font-weight:800;" onclick="openAddMemberModal('external')">+ Adicionar Externo</button>
                    </div>
                    <div class="card" style="padding:0; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="background:#f9fafb; border-bottom:1px solid #eee;">
                                <tr>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Especialista</th>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Empresa</th>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Email</th>
                                    <th style="padding:12px 24px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Projectos</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${TEAM.externals.map((e, i) => `
                                    <tr style="${i < TEAM.externals.length - 1 ? 'border-bottom:1px solid #f9fafb;' : ''} cursor:pointer;" onclick="openAddMemberModal('external', '${e.id}')" class="hover-row">
                                        <td style="padding:16px 24px; display:flex; align-items:center; gap:16px;">
                                            <div class="avatar" style="width:36px; height:36px; border-radius:18px; font-size:11px; flex-shrink:0; background:#fef3c7; color:#d97706;">${getInitials(e.name)}</div>
                                            <div>
                                                <div style="font-size:14px; font-weight:700; color:#111827;">${esc(e.name)}</div>
                                                <div style="font-size:11px; color:#9ca3af; font-weight:500;">${esc(e.specialty)}</div>
                                            </div>
                                        </td>
                                        <td class="table-td">${esc(e.company)}</td>
                                        <td class="table-td">${esc(e.email)}</td>
                                        <td style="padding:16px 24px; text-align:right; font-size:13px; color:#111827; font-weight:800;">${(e.projects || []).length}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Clientes -->
                <div style="margin-bottom:48px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#1a1714; margin:0;">Base de Clientes</h3>
                        <button class="btn btn-primary" style="padding:8px 20px; font-size:11px; font-weight:800;" onclick="openAddMemberModal('client')">+ Adicionar Cliente</button>
                    </div>
                    <div class="card" style="padding:0; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="background:#f9fafb; border-bottom:1px solid #eee;">
                                <tr>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Nome</th>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Email</th>
                                    <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Telefone</th>
                                    <th style="padding:12px 24px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Projecto Principal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${TEAM.clients.map((c, i) => {
                                    const proj = getProject(c.project);
                                    return `
                                        <tr style="${i < TEAM.clients.length - 1 ? 'border-bottom:1px solid #f9fafb;' : ''} cursor:pointer;" onclick="openAddMemberModal('client', '${c.id}')" class="hover-row">
                                            <td style="padding:16px 24px; display:flex; align-items:center; gap:16px;">
                                                <div class="avatar" style="width:36px; height:36px; border-radius:18px; font-size:11px; flex-shrink:0; background:#f0fdf4; color:#16a34a;">${getInitials(c.name)}</div>
                                                <div style="font-size:14px; font-weight:700; color:#111827;">${esc(c.name)}</div>
                                            </td>
                                            <td class="table-td">${esc(c.email)}</td>
                                            <td class="table-td">${esc(c.phone)}</td>
                                            <td style="padding:16px 24px; text-align:right; font-size:13px; color:#111827; font-weight:700;">${proj ? esc(proj.name) : '—'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}

function openAddMemberModal(type, existingId = null) {
    let item = null;
    if (existingId) {
        if (type === 'member') item = TEAM.members.find(m => m.id === existingId);
        else if (type === 'external') item = TEAM.externals.find(e => e.id === existingId);
        else item = TEAM.clients.find(c => c.id === existingId);
    }

    let title = existingId ? 'Editar Registo' : 'Novo Registo';
    let body = '';
    
    if (type === 'member') {
        body = `
            <div class="form-group">
                <label class="form-label">Nome Completo</label>
                <input type="text" id="addName" class="form-input" value="${item ? esc(item.name) : ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Cargo / Função</label>
                <select id="addFunction" class="form-input">
                    <option value="">Seleccione um cargo...</option>
                    ${SETTINGS.internalRoles.map(r => `<option value="${r}" ${item && (item.function === r || item.role === r) ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="addEmail" class="form-input" value="${item ? esc(item.email) : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Telefone</label>
                    <input type="text" id="addPhone" class="form-input" value="${item ? esc(item.phone) : ''}">
                </div>
            </div>
            ${isFullMode() && item ? (() => {
                const memberProjects = PROJECTS.filter(p => (p.team?.members || []).includes(item.id));
                const monthH = getMemberMonthlyHours(item.id);
                return `<div style="margin-top:20px; padding-top:16px; border-top:1px solid #eee;">
                    <p style="font-size:11px; font-weight:800; text-transform:uppercase; color:#9ca3af; margin-bottom:12px; letter-spacing:0.5px;">Perfil de Actividade</p>
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <span style="font-size:13px; color:#6b7280;">Horas este mês</span>
                        <span style="font-size:13px; font-weight:700; color:#111827;">${monthH.toFixed(1)}h</span>
                    </div>
                    <p style="font-size:11px; font-weight:700; color:#6b7280; margin-bottom:8px;">Projectos activos:</p>
                    ${memberProjects.length === 0 ? '<p style="font-size:12px; color:#9ca3af;">Sem projectos activos</p>' :
                        memberProjects.map(p => `<div style="font-size:12px; padding:4px 0; border-bottom:1px solid #f9fafb;">${esc(p.name)}</div>`).join('')}
                </div>`;
            })() : ''}
        `;
    } else if (type === 'external') {
        body = `
            <div class="form-group">
                <label class="form-label">Nome do Especialista</label>
                <input type="text" id="addName" class="form-input" value="${item ? esc(item.name) : ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Especialidade / Valência</label>
                <select id="addFunction" class="form-input">
                    <option value="">Seleccione uma especialidade...</option>
                    ${SETTINGS.externalSpecialties.map(s => `<option value="${s}" ${item && item.specialty === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Empresa</label>
                <input type="text" id="addCompany" class="form-input" value="${item ? esc(item.company) : ''}">
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="addEmail" class="form-input" value="${item ? esc(item.email) : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Telefone</label>
                    <input type="text" id="addPhone" class="form-input" value="${item ? esc(item.phone) : ''}">
                </div>
            </div>
            ${isFullMode() && item ? (() => {
                const assignedDeliverables = [];
                PROJECTS.forEach(p => {
                    p.phases.forEach(ph => {
                        ph.deliverables.filter(d => d.responsible === item.id).forEach(d => {
                            assignedDeliverables.push({ name: d.name, status: d.status, projectName: p.name });
                        });
                    });
                });
                const pending = assignedDeliverables.filter(d => d.status !== 'approved' && d.status !== 'done').length;
                return `<div style="margin-top:20px; padding-top:16px; border-top:1px solid #eee;">
                    <p style="font-size:11px; font-weight:800; text-transform:uppercase; color:#9ca3af; margin-bottom:12px; letter-spacing:0.5px;">Entregáveis Atribuídos (${pending} pendentes)</p>
                    ${assignedDeliverables.length === 0 ? '<p style="font-size:12px; color:#9ca3af;">Sem entregáveis atribuídos</p>' :
                        assignedDeliverables.slice(0, 8).map(d => `
                            <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #f9fafb; font-size:12px;">
                                <span style="color:#111827;">${esc(d.name)} <span style="color:#9ca3af;">· ${esc(d.projectName)}</span></span>
                                <span class="badge ${getStatusColor(d.status)}" style="font-size:9px;">${getStatusLabel(d.status)}</span>
                            </div>
                        `).join('')}
                </div>`;
            })() : ''}
        `;
    } else {
        body = `
            <div class="form-group">
                <label class="form-label">Nome do Cliente</label>
                <input type="text" id="addName" class="form-input" value="${item ? esc(item.name) : ''}">
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="addEmail" class="form-input" value="${item ? esc(item.email) : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Telefone</label>
                    <input type="text" id="addPhone" class="form-input" value="${item ? esc(item.phone) : ''}">
                </div>
            </div>
        `;
    }

    const footer = `
        <button class="btn btn-primary" style="padding:10px 32px;" onclick="saveNewTeamMember('${type}', '${existingId || ''}')">${existingId ? 'Actualizar' : 'Adicionar'}</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;

    openModal(title, body, footer);
}

function saveNewTeamMember(type, existingId) {
    const name = document.getElementById('addName').value.trim();
    const email = document.getElementById('addEmail').value.trim();
    const phone = document.getElementById('addPhone').value.trim();
    
    if (!name || !email) {
        showToast('Nome e Email são obrigatórios');
        return;
    }

    const memberData = {
        name,
        email,
        phone,
        ...(type === 'member' ? { function: document.getElementById('addFunction').value, role: 'member' } : {}),
        ...(type === 'external' ? { specialty: document.getElementById('addFunction').value, company: document.getElementById('addCompany').value } : {})
    };

    upsertTeamMember(type, memberData, existingId);

    closeModal();
    showToast(existingId ? 'Actualizado com sucesso' : 'Adicionado com sucesso');
    renderEquipa();
}

// ── CONFIGURAÇÕES ──

function saveOfficeSettings() {
    APP.office.name = document.getElementById('cfgOfficeName').value;
    APP.office.nif = document.getElementById('cfgOfficeNif').value;
    APP.office.address = document.getElementById('cfgOfficeAddress').value;
    APP.office.email = document.getElementById('cfgOfficeEmail').value;
    APP.office.phone = document.getElementById('cfgOfficePhone').value;
    persistAll();
    showToast('Definições guardadas com sucesso');
}

function renderConfiguracoes() {
    let html = `
        <div class="content-container">
            <div class="page-header">
                <h2 style="font-size:32px; font-weight:800; letter-spacing:-1px;">Configurações</h2>
            </div>

            <div class="tabs">
                <button class="tab-btn ${UI_STATE.config.tab === 'geral' ? 'active' : ''}" onclick="UI_STATE.config.tab='geral'; renderConfiguracoes();">Geral</button>
                <button class="tab-btn ${UI_STATE.config.tab === 'cargos' ? 'active' : ''}" onclick="UI_STATE.config.tab='cargos'; renderConfiguracoes();">Cargos Internos</button>
                <button class="tab-btn ${UI_STATE.config.tab === 'especialidades' ? 'active' : ''}" onclick="UI_STATE.config.tab='especialidades'; renderConfiguracoes();">Especialidades Externas</button>
            </div>

            <div class="page-body">
                ${renderConfigContent()}
            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}

function renderConfigContent() {
    if (UI_STATE.config.tab === 'geral') {
        return `
            <div style="margin-bottom:24px; padding:24px; border:1px solid #e5e7eb; background:#f9fafb; max-width:800px;">
                <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px; color:#111827;">Modo de Utilização</h3>
                <p style="font-size:13px; color:#6b7280; margin:0 0 20px;">Controla a complexidade da interface. O Modo Completo activa funcionalidades avançadas de análise financeira, filtros e vistas adicionais.</p>
                <div style="display:flex; gap:12px;">
                    <button onclick="APP.displayMode='simple'; persistAll(); handleRoute();"
                        style="flex:1; padding:16px; border:2px solid ${APP.displayMode==='simple'?'#111827':'#e5e7eb'}; background:${APP.displayMode==='simple'?'#111827':'#fff'}; color:${APP.displayMode==='simple'?'#fff':'#374151'}; font-weight:700; font-size:13px; cursor:pointer; text-align:center;">
                        Modo Simples<br><span style="font-size:11px; font-weight:400; opacity:0.7;">Foco no essencial</span>
                    </button>
                    <button onclick="APP.displayMode='full'; persistAll(); handleRoute();"
                        style="flex:1; padding:16px; border:2px solid ${APP.displayMode==='full'?'#111827':'#e5e7eb'}; background:${APP.displayMode==='full'?'#111827':'#fff'}; color:${APP.displayMode==='full'?'#fff':'#374151'}; font-weight:700; font-size:13px; cursor:pointer; text-align:center;">
                        Modo Completo<br><span style="font-size:11px; font-weight:400; opacity:0.7;">Todas as funcionalidades</span>
                    </button>
                </div>
            </div>
            <div class="card" style="padding:40px; max-width:800px;">
                <h3 style="font-size:18px; font-weight:800; margin-bottom:24px;">Informações do Atelier</h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                    <div class="form-group"><label class="form-label">Nome do Atelier</label><input type="text" class="form-input" id="cfgOfficeName" value="${APP.office.name}"></div>
                    <div class="form-group"><label class="form-label">NIF</label><input type="text" class="form-input" id="cfgOfficeNif" value="${APP.office.nif}"></div>
                    <div class="form-group" style="grid-column: span 2;"><label class="form-label">Morada Sede</label><input type="text" class="form-input" id="cfgOfficeAddress" value="${APP.office.address}"></div>
                    <div class="form-group"><label class="form-label">Email Geral</label><input type="text" class="form-input" id="cfgOfficeEmail" value="${APP.office.email}"></div>
                    <div class="form-group"><label class="form-label">Telefone</label><input type="text" class="form-input" id="cfgOfficePhone" value="${APP.office.phone}"></div>
                </div>
                
                <div style="margin-top:24px; border-top:1px solid #eee; padding-top:24px;">
                    <label class="form-label">Logótipo do Atelier (PNG/JPG)</label>
                    <div style="display:flex; align-items:center; gap:20px; margin-top:8px;">
                        <div id="cfgLogoPreview" style="width:120px; height:60px; border:1px dashed #ccc; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            ${APP.office.logo ? `<img src="${APP.office.logo}" style="max-width:100%; max-height:100%;">` : '<span style="font-size:10px; color:#9ca3af;">Sem Logo</span>'}
                        </div>
                        <input type="file" id="cfgLogoInput" accept="image/*" style="font-size:12px;" onchange="handleLogoUpload(this)">
                        ${APP.office.logo ? `<button class="btn btn-secondary btn-xs" style="color:#ef4444" onclick="APP.office.logo=null; persistAll(); renderConfiguracoes();">Remover</button>` : ''}
                    </div>
                    <p style="font-size:11px; color:#9ca3af; margin-top:8px;">Este logo será utilizado nos cabeçalhos das propostas e documentos PDF.</p>
                </div>

                <div style="margin-top:32px; padding-top:24px; border-top:1px solid #eee;">
                    <button class="btn btn-primary" onclick="saveOfficeSettings()">Guardar Alterações</button>
                </div>
            </div>
        `;
    }

    const isRoles = UI_STATE.config.tab === 'cargos';
    const list = isRoles ? SETTINGS.internalRoles : SETTINGS.externalSpecialties;
    const title = isRoles ? 'Lista de Cargos Disponíveis' : 'Lista de Especialidades Externas';

    return `
        <div class="card" style="padding:32px; max-width:600px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                <h3 style="font-size:16px; font-weight:800; margin:0;">${title}</h3>
                <button class="btn btn-secondary" style="font-size:11px; padding:6px 12px;" onclick="promptAddSetting('${isRoles ? 'roles' : 'specialty'}')">+ Novo</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
                ${list.map((item, i) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f9fafb; border:1px solid #eee;">
                        <span style="font-size:13px; font-weight:700; color:#111827;">${item}</span>
                        <button style="border:none; background:transparent; color:#ef4444; cursor:pointer; padding:4px;" onclick="removeSetting('${isRoles ? 'roles' : 'specialty'}', ${i})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function promptAddSetting(type) {
    const val = prompt("Introduza o novo valor:");
    if (!val) return;
    if (type === 'roles') SETTINGS.internalRoles.push(val);
    else SETTINGS.externalSpecialties.push(val);
    persistAll();
    renderConfiguracoes();
    showToast('Lista actualizada');
}

function removeSetting(type, index) {
    if (!confirm('Tem a certeza que deseja remover este item?')) return;
    if (type === 'roles') SETTINGS.internalRoles.splice(index, 1);
    else SETTINGS.externalSpecialties.splice(index, 1);
    persistAll();
    renderConfiguracoes();
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            APP.office.logo = e.target.result;
            persistAll();
            renderConfiguracoes();
            showToast('Logo carregado com sucesso');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

