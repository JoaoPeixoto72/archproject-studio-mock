function renderProjectTeamTab(proj) {
    const internal = proj.team.members.map(id => TEAM.members.find(m => m.id === id)).filter(Boolean);
    const external = proj.team.externals.map(id => TEAM.externals.find(e => e.id === id)).filter(Boolean);
    const clients = proj.team.clients.map(id => TEAM.clients.find(c => c.id === id)).filter(Boolean);

    let html = `
        <div style="display:flex; flex-direction:column; gap:40px;">
            
            <!-- Interna -->
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 class="section-title">Equipa Interna Atribuída</h3>
                    <button class="btn btn-secondary btn-xs" onclick="openAddProjectTeamModal('${proj.id}', 'member')">+ Adicionar Membro</button>
                </div>
                <div class="card" style="padding:0; overflow:hidden; border-radius:0;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f9fafb; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Membro</th>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Papel</th>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Contacto</th>
                                <th style="padding:10px 20px; text-align:right;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${internal.map(user => `
                                <tr style="border-bottom:1px solid #f9fafb;">
                                    <td style="padding:12px 20px; display:flex; align-items:center; gap:12px;">
                                        <div class="avatar" style="width:28px; height:28px; font-size:9px; background:#111827; color:#fff;">${getInitials(user.name)}</div>
                                        <span style="font-weight:700; color:#111827;">${user.name}</span>
                                    </td>
                                    <td style="padding:12px 20px; color:#6b7280;">${user.function || user.role}</td>
                                    <td style="padding:12px 20px; color:#6b7280;">${user.email}</td>
                                    <td style="padding:12px 20px; text-align:right;">
                                        <button style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:16px;" onclick="removeFromProject('${proj.id}', 'member', '${user.id}')">×</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Externos -->
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 class="section-title">Especialistas Externos</h3>
                    <button class="btn btn-secondary btn-xs" onclick="openAddProjectTeamModal('${proj.id}', 'external')">+ Adicionar Especialista</button>
                </div>
                <div class="card" style="padding:0; overflow:hidden; border-radius:0;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f9fafb; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Nome / Empresa</th>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Especialidade</th>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Contacto</th>
                                <th style="padding:10px 20px; text-align:right;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${external.length === 0 ? '<tr><td colspan="4" style="padding:20px; text-align:center; color:#9ca3af;">Nenhum colaborador externo adicionado.</td></tr>' : external.map(ext => `
                                <tr style="border-bottom:1px solid #f9fafb;">
                                    <td style="padding:12px 20px; display:flex; align-items:center; gap:12px;">
                                        <div class="avatar" style="width:28px; height:28px; font-size:9px; background:#fef3c7; color:#d97706;">${getInitials(ext.name)}</div>
                                        <div>
                                            <div style="font-weight:700; color:#111827;">${ext.name}</div>
                                            <div style="font-size:10px; color:#9ca3af;">${ext.company}</div>
                                        </div>
                                    </td>
                                    <td style="padding:12px 20px; color:#6b7280;">${ext.specialty}</td>
                                    <td style="padding:12px 20px; color:#6b7280;">${ext.email}</td>
                                    <td style="padding:12px 20px; text-align:right;">
                                        <button style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:16px;" onclick="removeFromProject('${proj.id}', 'external', '${ext.id}')">×</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Clientes -->
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 class="section-title">Clientes</h3>
                    <button class="btn btn-secondary btn-xs" onclick="openAddProjectTeamModal('${proj.id}', 'client')">+ Associar Cliente</button>
                </div>
                <div class="card" style="padding:0; overflow:hidden; border-radius:0;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f9fafb; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Nome</th>
                                <th style="padding:10px 20px; text-align:left; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-size:9px;">Email</th>
                                <th style="padding:10px 20px; text-align:right;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clients.length === 0 ? '<tr><td colspan="3" style="padding:20px; text-align:center; color:#9ca3af;">Nenhum cliente associado.</td></tr>' : clients.map(cl => `
                                <tr style="border-bottom:1px solid #f9fafb;">
                                    <td style="padding:12px 20px; display:flex; align-items:center; gap:12px;">
                                        <div class="avatar" style="width:28px; height:28px; font-size:9px; background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;">${getInitials(cl.name)}</div>
                                        <span style="font-weight:700; color:#111827;">${cl.name}</span>
                                    </td>
                                    <td style="padding:12px 20px; color:#6b7280;">${cl.email}</td>
                                    <td style="padding:12px 20px; text-align:right;">
                                        <button style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:16px;" onclick="removeFromProject('${proj.id}', 'client', '${cl.id}')">×</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;
    return html;
}

function openAddProjectTeamModal(projectId, type) {
    const proj = PROJECTS.find(p => p.id === projectId);
    const existingIds = type === 'member' ? proj.team.members : (type === 'external' ? proj.team.externals : proj.team.clients);
    
    let available = [];
    if (type === 'member') available = TEAM.members.filter(m => !existingIds.includes(m.id));
    else if (type === 'external') available = TEAM.externals.filter(e => !existingIds.includes(e.id));
    else available = TEAM.clients.filter(c => !existingIds.includes(c.id));

    if (available.length === 0) {
        showToast('Não existem mais contactos disponíveis nesta categoria.');
        return;
    }

    const body = `
        <div class="form-group">
            <label class="form-label">Seleccionar para adicionar</label>
            <select class="form-input" id="addTeamSelection">
                ${available.map(a => `<option value="${a.id}">${a.name} ${a.specialty ? '(' + a.specialty + ')' : ''}</option>`).join('')}
            </select>
        </div>
    `;

    const footer = `
        <button class="btn btn-primary" onclick="confirmAddToProject('${projectId}', '${type}')">Adicionar ao Projecto</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Adicionar à Equipa', body, footer);
}

function confirmAddToProject(projectId, type) {
    const val = document.getElementById('addTeamSelection').value;
    addTeamMember(projectId, type, val);
    closeModal();
    renderProject();
}

function removeFromProject(projectId, type, id) {
    if (!confirm('Deseja retirar esta pessoa do projecto?')) return;
    
    // Guarda: bloquear remoção do utilizador actual
    if (type === 'member' && id === APP.currentUser.id) {
        showToast('Não pode remover-se a si próprio do projecto.');
        return;
    }
    
    removeTeamMember(projectId, type, id);
    renderProject();
}
function openPendenciaModal(projectId, pendId) {
    const proj = getProject(projectId);
    if (!proj) return;
    const pend = proj.pendencias.find(p => p.id === pendId);
    if (!pend) return;

    const body = `
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <input type="text" class="form-input"
                   id="pendDesc" value="${esc(pend.description)}">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
                <label class="form-label">Prioridade</label>
                <select class="form-input" id="pendPriority">
                    <option value="high"   ${pend.priority==='high'   ?'selected':''}>Alta</option>
                    <option value="medium" ${pend.priority==='medium' ?'selected':''}>Média</option>
                    <option value="low"    ${pend.priority==='low'    ?'selected':''}>Baixa</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Prazo</label>
                <input type="date" class="form-input"
                       id="pendDeadline" value="${pend.deadline || ''}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Responsável</label>
            <select class="form-input" id="pendResponsible">
                <option value="">— Não atribuído —</option>
                ${getAllTeamOptions(pend.responsible)}
            </select>
        </div>
        <div class="form-group" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="pendClosed"
                   ${pend.status==='closed'?'checked':''}>
            <label for="pendClosed"
                   style="font-size:13px;font-weight:600;margin:0;cursor:pointer;">
                Marcar como resolvida
            </label>
        </div>
    `;

    const footer = `
        <button class="btn btn-primary"
                onclick="savePendencia('${projectId}','${pendId}')">
            Guardar
        </button>
        <button class="btn btn-secondary" onclick="closeModal()">
            Cancelar
        </button>
    `;

    openModal('Pendência', body, footer);
}

function savePendencia(projectId, pendId) {
    updatePendencia(projectId, pendId, {
        description: document.getElementById('pendDesc').value.trim(),
        priority:    document.getElementById('pendPriority').value,
        deadline:    document.getElementById('pendDeadline').value || null,
        responsible: document.getElementById('pendResponsible').value || null,
        status:      document.getElementById('pendClosed').checked ? 'closed' : 'open'
    });
    closeModal();
    showToast('Pendência actualizada');
    updateBadges();
    handleRoute();
}

function openNewPendenciaModal(projectId, phaseKey) {
    const body = `
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <input type="text" class="form-input" id="newPendDesc"
                   placeholder="Descreva a pendência...">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
                <label class="form-label">Prioridade</label>
                <select class="form-input" id="newPendPriority">
                    <option value="high">Alta</option>
                    <option value="medium" selected>Média</option>
                    <option value="low">Baixa</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Prazo</label>
                <input type="date" class="form-input" id="newPendDeadline">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Responsável</label>
            <select class="form-input" id="newPendResponsible">
                <option value="">— Não atribuído —</option>
                ${getAllTeamOptions(null)}
            </select>
        </div>
    `;

    const footer = `
        <button class="btn btn-primary"
                onclick="createPendencia('${projectId}','${phaseKey}')">
            Criar
        </button>
        <button class="btn btn-secondary" onclick="closeModal()">
            Cancelar
        </button>
    `;

    openModal('Nova Pendência', body, footer);
}

function createPendencia(projectId, phaseKey) {
    const desc = document.getElementById('newPendDesc').value.trim();
    if (!desc) { showToast('Descrição obrigatória'); return; }
    addPendencia(projectId, {
        description: desc,
        priority:    document.getElementById('newPendPriority').value,
        responsible: document.getElementById('newPendResponsible').value || null,
        deadline:    document.getElementById('newPendDeadline').value || null,
        phase:       phaseKey
    });
    closeModal();
    showToast('Pendência criada');
    updateBadges();
    handleRoute();
}

