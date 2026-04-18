function renderProjectPhases(proj) {
    let html = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:700; margin:0;">Fases e Entregáveis</h3>
            <button class="btn btn-secondary btn-sm" onclick="openAddPhaseModal('${proj.id}')">+ Adicionar Fase</button>
        </div>
    `;

    if (proj.phases.length === 0) {
        return html + `<div class="card" style="padding:32px; text-align:center; color:#9ca3af;">Nenhuma fase definida.</div>`;
    }

    proj.phases.forEach(phase => {
        const total = phase.deliverables.length;
        const filled = phase.deliverables.filter(d => isDeliverableFilled(d)).length;
        const pendingApprovals = phase.approvals.filter(a => a.status === 'pending');
        
        let blockMsg = '';
        if (phase.status === 'active' && total > 0 && filled < total) {
            blockMsg = `<span style="color:#d97706; font-size:11px; font-weight:600; margin-left:8px;">Bloqueada: faltam entregáveis</span>`;
        } else if (phase.status === 'active' && pendingApprovals.length > 0) {
            blockMsg = `<span style="color:#d97706; font-size:11px; font-weight:600; margin-left:8px;">Bloqueada: aguarda aprovação</span>`;
        }

        let phaseControls = '';
        if (phase.status === 'ready') {
            phaseControls = `<button class="btn btn-primary btn-xs" onclick="activatePhase('${proj.id}','${phase.key}')">Iniciar Fase</button>`;
        } else if (phase.status === 'active') {
            phaseControls = `
                <button class="btn btn-success btn-xs" onclick="completePhase('${proj.id}','${phase.key}')">✓ Concluir</button>
                <button class="btn btn-danger btn-xs" onclick="blockPhase('${proj.id}','${phase.key}')">Bloquear</button>
            `;
        } else if (phase.status === 'blocked') {
            phaseControls = `<button class="btn btn-warning btn-xs" onclick="activatePhase('${proj.id}','${phase.key}')">Desbloquear</button>`;
        } else if (phase.status === 'pending') {
            phaseControls = `<button class="btn btn-danger btn-xs" style="border:1px solid #fecaca; color:#dc2626; background:transparent;" onclick="deletePhaseRequest('${proj.id}','${phase.key}')">Remover Fase</button>`;
        }

        html += `
            <div class="card" style="margin-bottom:16px; overflow:hidden;">
                <!-- Cabeçalho da Fase -->
                <div style="padding:16px; background:#f9fafb; border-bottom:1px solid #f0ece7; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="phase-dot ${phase.status}" style="width:32px; height:32px; font-size:11px;">${phase.abbr}</div>
                        <div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:14px; font-weight:700;">${esc(phase.name)}</span>
                                <span class="badge ${getStatusColor(phase.status)}" style="font-size:10px;">${getStatusLabel(phase.status)}</span>
                                ${phaseControls}
                            </div>
                            <div style="font-size:11px; color:#9a928a; margin-top:4px;">
                                <span style="font-weight:600; color:#111827;">${filled} / ${total}</span> entregáveis preenchidos
                                ${pendingApprovals.length > 0 ? ` · <span style="color:#dc2626; font-weight:600;">${pendingApprovals.length} aprovações pendentes</span>` : ''}
                                ${blockMsg}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Lista de Entregáveis -->
                <div style="padding:0;">
                    ${phase.deliverables.length === 0 ? `<div style="padding:16px; text-align:center; color:#9ca3af; font-size:12px;">Sem entregáveis nesta fase.</div>` : ''}
                    ${phase.deliverables.filter(del => canUserSeeDeliverable(APP.currentUser.id, del, proj)).map((del, i) => {
                        const isFilled = isDeliverableFilled(del);
                        const statusColor = isFilled ? '#16a34a' : '#d1d5db'; // Verde ou Cinzento
                        
                        const docsCount = (del.documents || []).filter(d => (d.fileType || 'document') === 'document').length;
                        const photosCount = (del.documents || []).filter(d => d.fileType === 'photo').length;
                        const notesCount = (del.notes || []).length;
                        
                        const respName = del.responsible ? getPersonName(del.responsible) : 'Não atribuído';

                        return `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; ${i < total - 1 ? 'border-bottom:1px solid #f0ece7;' : ''}">
                            <div style="display:flex; align-items:center; gap:12px; flex:1;">
                                <div style="width:12px; height:12px; border-radius:50%; background:${statusColor}; flex-shrink:0;" title="${isFilled ? 'Preenchido' : 'Por preencher'}"></div>
                                <div style="flex:1; min-width:0;">
                                    <p style="font-size:13px; font-weight:700; margin:0; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(del.name)}</p>
                                    <p style="font-size:10px; color:#9ca3af; margin:0;">Resp: <strong>${esc(respName)}</strong></p>
                                </div>
                                <div style="display:flex; gap:12px; font-size:10px; color:#6b7280; font-weight:600; width:180px; justify-content:flex-end; margin-right:16px;">
                                    <span><strong style="color:#111827;">${docsCount}</strong> docs</span>
                                    <span><strong style="color:#111827;">${photosCount}</strong> fotos</span>
                                    <span><strong style="color:#111827;">${notesCount}</strong> notas</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:6px; flex-shrink:0;">
                                <button class="btn btn-secondary btn-xs" style="font-weight:700; height:24px; padding:0 10px;" onclick="viewDeliverableModal('${proj.id}','${phase.key}','${del.id}')" title="Ver Detalhes">Ver</button>
                                <button class="btn btn-secondary btn-xs" style="font-weight:700; height:24px; padding:0 10px;" onclick="openDeliverableNoteModal('${proj.id}','${phase.key}','${del.id}')">+ Nota</button>
                                <button class="btn btn-secondary btn-xs" style="color:#ef4444; height:24px; padding:0 10px;" onclick="deleteDeliverableRequest('${proj.id}','${del.id}')" title="Remover">×</button>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                </div>
                
                ${phase.approvals && phase.approvals.length > 0 ? `
                <div style="padding:12px 16px; border-top:1px solid #f0ece7; background:#fff;">
                    <p style="font-size:11px; font-weight:800; color:#9ca3af; text-transform:uppercase; margin-bottom:10px; letter-spacing:0.5px;">Aprovações e Validações</p>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${phase.approvals.map(a => `
                            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f9fafb; border-radius:6px; border:1px solid #f3f4f6;">
                                <div>
                                    <span style="font-size:12px; font-weight:700; color:#111827;">${esc(a.name)}</span>
                                    <span style="font-size:10px; color:#9a928a; margin-left:6px;">(${esc(a.type)})</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span class="badge ${getStatusColor(a.status)}" style="font-size:10px;">${getStatusLabel(a.status)}</span>
                                    ${a.status === 'pending' ? `
                                        <div style="display:flex; gap:4px;">
                                            <button class="btn btn-success btn-xs" style="padding:2px 8px;" onclick="approveApproval('${proj.id}','${phase.key}','${a.id}')">Aprovar</button>
                                            <button class="btn btn-danger btn-xs" style="padding:2px 8px;" onclick="rejectApproval('${proj.id}','${phase.key}','${a.id}')">Rejeitar</button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div style="padding:10px 16px; background:#f9fafb; border-top:1px solid #f0ece7; display:flex; justify-content:flex-end; gap:8px;">
                    <button class="btn btn-secondary btn-xs" onclick="openAddApprovalModal('${proj.id}','${phase.key}')">+ Adicionar Aprovação</button>
                    <button class="btn btn-secondary btn-xs" onclick="openAddDeliverableModal('${proj.id}','${phase.key}')">+ Adicionar Entregável</button>
                </div>
            </div>
        `;
    });

    return html;
}

function viewDeliverableModal(projectId, phaseKey, deliverableId) {
    const proj = getProject(projectId);
    const phase = proj.phases.find(ph => ph.key === phaseKey);
    const del = phase.deliverables.find(d => d.id === deliverableId);
    if (!del) return;

    const respName = del.responsible ? getPersonName(del.responsible) : 'Não atribuído';
    const docs = (del.documents || []).filter(d => (d.fileType || 'document') === 'document');
    const photos = (del.documents || []).filter(d => d.fileType === 'photo');
    const notes = del.notes || [];

    const docList = docs.length > 0 ? docs.map(d => `<div style="font-size:12px; color:#111827; padding:4px 0; border-bottom:1px dashed #e5e7eb;">📄 ${esc(d.filename)}</div>`).join('') : '<p style="font-size:11px; color:#9ca3af;">Sem documentos.</p>';
    const photoList = photos.length > 0 ? photos.map(p => `<div style="font-size:12px; color:#111827; padding:4px 0; border-bottom:1px dashed #e5e7eb;">📷 ${esc(p.filename)}</div>`).join('') : '<p style="font-size:11px; color:#9ca3af;">Sem fotografias.</p>';
    const notesList = notes.length > 0 ? notes.map(n => `
        <div style="padding:8px 0; border-bottom:1px dashed #e5e7eb; position:relative;">
            <p style="font-size:12px; margin:0 0 4px; color:#111827;">${esc(n.text)}</p>
            <p style="font-size:10px; color:#9ca3af; margin:0;">${esc(getPersonName(n.author))} · ${new Date(n.date).toLocaleString('pt-PT').slice(0, 16)}</p>
            <button onclick="removeDeliverableNoteRequest('${projectId}', '${deliverableId}', '${n.id}')" style="position:absolute; right:0; top:8px; border:none; background:transparent; color:#ef4444; font-size:14px; cursor:pointer;" title="Apagar Nota">×</button>
        </div>`).join('') : '<p style="font-size:11px; color:#9ca3af;">Sem notas.</p>';

    const body = `
        <div style="margin-bottom:16px;">
            <p style="font-size:11px; text-transform:uppercase; color:#9ca3af; font-weight:700; margin-bottom:4px;">${esc(phase.name)}</p>
            <h4 style="font-size:16px; font-weight:800; margin:0; color:#111827;">${esc(del.name)}</h4>
            <p style="font-size:12px; color:#6b7280; margin:4px 0 0;">Responsável: <strong>${esc(respName)}</strong></p>
        </div>
        
        <div style="margin-bottom:20px;">
            <h5 style="font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; margin:0 0 8px;">Documentos</h5>
            <div style="background:#f9fafb; border:1px solid #f3f4f6; padding:8px 12px; border-radius:6px; max-height:120px; overflow-y:auto;">
                ${docList}
            </div>
            <p style="font-size:10px; color:#6b7280; margin-top:4px; font-style:italic;">Use o separador Documentos do projecto para fazer upload/download.</p>
        </div>

        <div style="margin-bottom:20px;">
            <h5 style="font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; margin:0 0 8px;">Fotografias</h5>
            <div style="background:#f9fafb; border:1px solid #f3f4f6; padding:8px 12px; border-radius:6px; max-height:120px; overflow-y:auto;">
                ${photoList}
            </div>
        </div>

        <div>
            <h5 style="font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; margin:0 0 8px;">Notas</h5>
            <div style="background:#fafaf9; border-left:3px solid #e2ddd7; padding:8px 12px; border-radius:0 6px 6px 0; max-height:150px; overflow-y:auto;">
                ${notesList}
            </div>
        </div>
    `;

    openModal('Detalhes do Entregável', body, `<button class="btn btn-secondary" onclick="closeModal()">Fechar</button>`);
}

function openDeliverableNoteModal(projectId, phaseKey, deliverableId) {
    const body = `
        <div class="form-group">
            <label class="form-label">Registar Nota</label>
            <textarea class="form-input" id="newDelNoteText" placeholder="Escreva a observação..." rows="4"></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="confirmAddDeliverableNote('${projectId}','${deliverableId}')">Adicionar Nota</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Adicionar Nota', body, footer);
}

function confirmAddDeliverableNote(projectId, deliverableId) {
    const text = document.getElementById('newDelNoteText').value.trim();
    if (!text) {
        showToast('A nota não pode estar vazia');
        return;
    }
    addDeliverableNote(projectId, deliverableId, text);
    closeModal();
    showToast('Nota adicionada');
    handleRoute();
}

function removeDeliverableNoteRequest(projectId, deliverableId, noteId) {
    if (confirm('Tem a certeza que deseja apagar esta nota?')) {
        removeDeliverableNote(projectId, deliverableId, noteId);
        showToast('Nota apagada');
        closeModal(); // Fecha o modal de "Ver" para reflectir alteração e evitar inconsistências visuais
        handleRoute();
    }
}


// ============================================================================
// PHASE ACTIONS
// ============================================================================

function activatePhase(projectId, phaseKey) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;

    const unmetDeps = (phase.dependencies || []).filter(depKey => {
        const dep = proj.phases.find(ph => ph.key === depKey);
        return dep && dep.status !== 'done';
    });

    if (unmetDeps.length > 0) {
        const depNames = unmetDeps.map(dk => {
            const dp = proj.phases.find(p => p.key === dk);
            return dp ? dp.abbr + ' — ' + dp.name : dk;
        }).join(', ');

        const body = `
            <div style="text-align:center; padding:10px 0;">
                <div style="width:48px; height:48px; background:#fef3c7; color:#d97706; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <p style="font-size:15px; font-weight:700; margin-bottom:8px; color:#111827;">Dependências não concluídas</p>
                <p style="font-size:13px; color:#6b7280; line-height:1.5;">A fase <strong>${esc(phase.name)}</strong> depende de:<br><strong>${esc(depNames)}</strong><br><br>Estas fases ainda não estão concluídas. Pretende iniciar mesmo assim?</p>
            </div>
        `;
        const footer = `
            <button class="btn btn-primary" onclick="forceActivatePhase('${projectId}','${phaseKey}')">Iniciar Mesmo Assim</button>
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        `;
        openModal('Aviso de Dependências', body, footer);
        return;
    }

    forceActivatePhase(projectId, phaseKey);
}

function forceActivatePhase(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    closeModal();
    updatePhaseStatus(projectId, phaseKey, 'active');
    const proj = getProject(projectId);
    proj.currentPhaseKey = phaseKey;
    refreshPhaseStatuses(projectId);
    showToast('Fase ' + phase.abbr + ' iniciada');
    persistAll();
    handleRoute();
}

function completePhase(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    updatePhaseStatus(projectId, phaseKey, 'done', todayStr());

    // Recalcular estados das fases dependentes
    refreshPhaseStatuses(projectId);

    // Verificar se todas as fases estão done
    const proj = getProject(projectId);
    const allDone = proj.phases.every(ph => ph.status === 'done');
    if (allDone) {
        updateProjectStatus(projectId, 'completed');
    }

    // Actualizar currentPhaseKey para a primeira fase active ou ready
    const nextActive = proj.phases.find(ph => ph.status === 'active');
    const nextReady = proj.phases.find(ph => ph.status === 'ready');
    if (nextActive) {
        updateProjectCurrentPhase(projectId, nextActive.key);
    } else if (nextReady) {
        updateProjectCurrentPhase(projectId, nextReady.key);
    }

    showToast('Fase ' + phase.abbr + ' concluída');
    updateBadges();
    handleRoute();
}

function blockPhase(projectId, phaseKey) {
    const body = `
        <div class="form-group">
            <label class="form-label">Motivo do bloqueio</label>
            <textarea class="form-input" id="blockReason" placeholder="Descreva o motivo..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-danger" onclick="confirmBlockPhase('${projectId}','${phaseKey}')">Bloquear Fase</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Bloquear Fase', body, footer);
}

function confirmBlockPhase(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    updatePhaseStatus(projectId, phaseKey, 'blocked');
    const reason = document.getElementById('blockReason').value.trim() || 'Sem motivo especificado';
    addHistoryEntry(projectId, 'Bloqueou fase', phase.name + ': ' + reason, phaseKey);
    closeModal();
    showToast('Fase bloqueada');
    handleRoute();
}

function editPhaseDetails(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;

    const body = `
        <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="editPhaseName" value="${esc(phase.name)}">
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea class="form-input" id="editPhaseDesc">${esc(phase.description)}</textarea>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
                <label class="form-label">Data de início</label>
                <input type="date" class="form-input" id="editPhaseStart" value="${phase.startDate || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Data prevista de fim</label>
                <input type="date" class="form-input" id="editPhaseEnd" value="${phase.endDate || ''}">
            </div>
        </div>
    `;

    const footer = `
        <button class="btn btn-primary" onclick="savePhaseDetails('${projectId}','${phaseKey}')">Guardar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Editar Fase — ' + phase.abbr, body, footer);
}

function savePhaseDetails(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    phase.name = document.getElementById('editPhaseName').value.trim() || phase.name;
    phase.description = document.getElementById('editPhaseDesc').value.trim();
    phase.startDate = document.getElementById('editPhaseStart').value || phase.startDate;
    phase.endDate = document.getElementById('editPhaseEnd').value || phase.endDate;
    addHistoryEntry(projectId, 'Editou fase', phase.name, phaseKey);
    closeModal();
    showToast('Fase actualizada');
    persistAll();
    handleRoute();
}

function openAddPhaseModal(projectId) {
    const body = `
        <div class="form-group">
            <label class="form-label">Abreviatura (2-3 letras)</label>
            <input type="text" class="form-input" id="newPhaseAbbr" placeholder="Ex: EX" maxlength="3">
        </div>
        <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="newPhaseName" placeholder="Ex: Fase Extra">
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea class="form-input" id="newPhaseDesc" placeholder="Descrição da fase..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="addPhaseToProject('${projectId}')">Adicionar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Adicionar Fase', body, footer);
}

function addPhaseToProject(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;
    const abbr = document.getElementById('newPhaseAbbr').value.trim().toUpperCase();
    const name = document.getElementById('newPhaseName').value.trim();
    if (!abbr || !name) { showToast('Abreviatura e nome são obrigatórios'); return; }

    proj.phases.push({
        key: abbr.toLowerCase() + '_' + Date.now(),
        abbr: abbr,
        name: name,
        description: document.getElementById('newPhaseDesc').value.trim(),
        order: proj.phases.length + 1,
        dependencies: [],
        status: 'pending',
        startDate: null, endDate: null, endDateActual: null,
        deliverables: [], approvals: [], photos: [], notes: []
    });

    addHistoryEntry(projectId, 'Adicionou fase', name);
    closeModal();
    showToast('Fase adicionada');
    persistAll();
    handleRoute();
}

// ============================================================================
// DELIVERABLE ACTIONS
// ============================================================================

function markDeliverableDone(projectId, phaseKey, deliverableId) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return;
    updateDeliverable(projectId, result.deliverable.id, { status: 'approved' });
    showToast('Entregável concluído');
    handleRoute();
}

function editDeliverable(projectId, phaseKey, deliverableId) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return;
    const del = result.deliverable;

    const body = `
        <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="editDelName" value="${esc(del.name)}">
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea class="form-input" id="editDelDesc">${esc(del.description)}</textarea>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
                <label class="form-label">Estado</label>
                <select class="form-input" id="editDelStatus">
                    <option value="pending" ${del.status === 'pending' ? 'selected' : ''}>Pendente</option>
                    <option value="in-progress" ${del.status === 'in-progress' ? 'selected' : ''}>Em Progresso</option>
                    <option value="in-review" ${del.status === 'in-review' ? 'selected' : ''}>Em Revisão</option>
                    <option value="done" ${del.status === 'done' ? 'selected' : ''}>Concluído</option>
                    <option value="approved" ${del.status === 'approved' ? 'selected' : ''}>Aprovado</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Responsável</label>
                <select class="form-input" id="editDelResp">
                    <option value="">— Não atribuído —</option>
                    ${getAllTeamOptions(del.responsible)}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Visibilidade</label>
            <div style="display:flex; gap:14px; flex-wrap:wrap;">
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="editDelVis" value="admin" ${del.visibility.includes('admin') ? 'checked' : ''}> Gabinete
                </label>
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="editDelVis" value="member" ${del.visibility.includes('member') ? 'checked' : ''}> Membros
                </label>
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="editDelVis" value="client" ${del.visibility.includes('client') ? 'checked' : ''}> Cliente
                </label>
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="editDelVis" value="external" ${del.visibility.includes('external') ? 'checked' : ''}> Externo
                </label>
            </div>
        </div>
    `;

    const footer = `
        <button class="btn btn-primary" onclick="saveDeliverable('${projectId}','${phaseKey}','${deliverableId}')">Guardar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Editar Entregável', body, footer);
}

function saveDeliverable(projectId, phaseKey, deliverableId) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return;

    const visChecks = document.querySelectorAll('.editDelVis:checked');
    const changes = {
        name: document.getElementById('editDelName').value.trim() || result.deliverable.name,
        description: document.getElementById('editDelDesc').value.trim(),
        status: document.getElementById('editDelStatus').value,
        responsible: document.getElementById('editDelResp').value || null,
        visibility: Array.from(visChecks).map(cb => cb.value)
    };

    updateDeliverable(projectId, deliverableId, changes);
    closeModal();
    showToast('Entregável actualizado');
    handleRoute();
}

function openAddDeliverableModal(projectId, phaseKey) {
    const body = `
        <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="newDelName" placeholder="Nome do entregável">
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea class="form-input" id="newDelDesc" placeholder="Descrição..."></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Responsável</label>
            <select class="form-input" id="newDelResp">
                <option value="">— Não atribuído —</option>
                ${getAllTeamOptions(null)}
            </select>
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="addDeliverableFromModal('${projectId}','${phaseKey}')">Adicionar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Novo Entregável', body, footer);
}

function addDeliverableFromModal(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const name = document.getElementById('newDelName').value.trim();
    if (!name) { showToast('Nome é obrigatório'); return; }

    const delData = {
        name: name,
        description: document.getElementById('newDelDesc').value.trim(),
        responsible: document.getElementById('newDelResp').value || null
    };

    addDeliverable(projectId, phaseKey, delData);
    
    closeModal();
    showToast('Entregável adicionado');
    handleRoute();
}

// ============================================================================
// APPROVAL ACTIONS
// ============================================================================

function approveApproval(projectId, phaseKey, approvalId) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const apr = phase.approvals.find(a => a.id === approvalId);
    if (!apr) return;

    updateApprovalStatus(projectId, phaseKey, approvalId, 'approved');
    showToast('Aprovação registada');
    updateBadges();
    handleRoute();
}

function rejectApproval(projectId, phaseKey, approvalId) {
    const body = `
        <div class="form-group">
            <label class="form-label">Motivo da rejeição</label>
            <textarea class="form-input" id="rejectApprovalNotes" placeholder="Descreva o motivo..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-danger" onclick="confirmRejectApproval('${projectId}','${phaseKey}','${approvalId}')">Rejeitar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Rejeitar Aprovação', body, footer);
}

function confirmRejectApproval(projectId, phaseKey, approvalId) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const apr = phase.approvals.find(a => a.id === approvalId);
    if (!apr) return;

    const notes = document.getElementById('rejectApprovalNotes').value.trim() || 'Rejeitado.';
    updateApprovalStatus(projectId, phaseKey, approvalId, 'rejected', notes);
    closeModal();
    showToast('Aprovação rejeitada');
    handleRoute();
}

function openAddApprovalModal(projectId, phaseKey) {
    openSimpleAddModal('Nova Aprovação', [
        { id: 'newAprName', label: 'Nome da aprovação', placeholder: 'Ex: Aprovação pelo cliente' },
        { id: 'newAprType', label: 'Tipo', type: 'select', options: [['internal','Interna'],['client','Cliente'],['council','Câmara Municipal'],['specialties','Especialidades']] }
    ], `addApproval('${projectId}','${phaseKey}')`);
}

function openSimpleAddModal(title, fields, onSubmit) {
    const fieldsHtml = fields.map(f => {
        if (f.type === 'textarea') {
            return `<div class="form-group"><label class="form-label">${f.label}</label><textarea class="form-input" id="${f.id}" placeholder="${f.placeholder || ''}" rows="${f.rows || 4}"></textarea></div>`;
        } else if (f.type === 'select') {
            const opts = (f.options || []).map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
            return `<div class="form-group"><label class="form-label">${f.label}</label><select class="form-input" id="${f.id}">${opts}</select></div>`;
        } else if (f.type === 'file') {
            return `<div class="form-group"><label class="form-label">${f.label}</label><input type="file" class="form-input" id="${f.id}" accept="${f.accept || '*'}" style="padding:8px;"></div>`;
        }
        return `<div class="form-group"><label class="form-label">${f.label}</label><input type="${f.type || 'text'}" class="form-input" id="${f.id}" placeholder="${f.placeholder || ''}"></div>`;
    }).join('');
    const footer = `<button class="btn btn-primary" onclick="${onSubmit}">Adicionar</button><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>`;
    openModal(title, fieldsHtml, footer);
}

function addApproval(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const name = document.getElementById('newAprName').value.trim();
    if (!name) { showToast('Nome é obrigatório'); return; }

    phase.approvals.push({
        id: generateId(),
        type: document.getElementById('newAprType').value,
        name: name,
        status: 'pending',
        submittedAt: null, respondedAt: null, respondedBy: null, notes: ''
    });

    addHistoryEntry(projectId, 'Adicionou aprovação', name, phaseKey);
    closeModal();
    showToast('Aprovação adicionada');
    persistAll();
    handleRoute();
}

// PHOTO & NOTE MODALS (usam openSimpleAddModal definida na secção de fases)

function addPhoto(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const fileInput = document.getElementById('newPhotoFile');
    const filename = fileInput?.files?.length > 0 ? fileInput.files[0].name : 'foto_' + Date.now() + '.jpg';
    const desc = document.getElementById('newPhotoDesc').value.trim() || filename;
    addPhotoToPhase(projectId, phaseKey, { filename, description: desc });
    closeModal();
    showToast('Foto adicionada');
    handleRoute();
}

function openAddPhotoModal(projectId, phaseKey) {
    openSimpleAddModal('Adicionar Foto', [
        { id: 'newPhotoFile', label: 'Ficheiro', type: 'file', accept: 'image/*' },
        { id: 'newPhotoDesc', label: 'Descrição', placeholder: 'Descrição da foto' }
    ], `addPhoto('${projectId}','${phaseKey}')`);
}

function addNote(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const text = document.getElementById('newNoteText').value.trim();
    if (!text) { showToast('Nota não pode estar vazia'); return; }
    addNoteToPhase(projectId, phaseKey, { text });
    closeModal();
    showToast('Nota adicionada');
    handleRoute();
}

function openAddNoteModal(projectId, phaseKey) {
    openSimpleAddModal('Adicionar Nota', [
        { id: 'newNoteText', label: 'Nota', type: 'textarea', placeholder: 'Escreva a nota...', rows: 4 }
    ], `addNote('${projectId}','${phaseKey}')`);
}

// ============================================================================
// TAB 3: DOCUMENTOS (aggregated view)
// ============================================================================

function deletePhaseRequest(projectId, phaseKey) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;

    const body = `
        <div style="text-align:center; padding:10px 0;">
            <div style="width:48px; height:48px; background:#fee2e2; color:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </div>
            <p style="font-size:15px; font-weight:700; margin-bottom:8px; color:#111827;">Apagar fase "${phase.name}"?</p>
            <p style="font-size:13px; color:#6b7280; line-height:1.5;">Esta acção não pode ser desfeita. Todos os entregáveis, documentos e histórico associados serão perdidos.</p>
        </div>
    `;

    const footer = `
        <button class="btn btn-danger" style="width:100%; margin-bottom:8px;" onclick="confirmDeletePhase('${projectId}','${phaseKey}')">Apagar Fase Permanentemente</button>
        <button class="btn btn-secondary" style="width:100%;" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Confirmar Remoção', body, footer);
}

function confirmDeletePhase(projectId, phaseKey) {
    if (removePhase(projectId, phaseKey)) {
        closeModal();
        showToast('Fase removida com sucesso');
        handleRoute();
    }
}

function deleteDocumentRequest(projectId, deliverableId, docId) {
    const res = getDeliverable(projectId, deliverableId);
    if (!res) return;
    const doc = res.deliverable.documents.find(d => d.id === docId);
    if (!doc) return;

    const body = `
        <div style="text-align:center; padding:10px 0;">
            <p style="font-size:15px; font-weight:700; margin-bottom:8px; color:#111827;">Apagar ficheiro "${doc.filename}"?</p>
            <p style="font-size:13px; color:#6b7280; line-height:1.5;">Esta acção não pode ser revertida e removerá também o histórico de versões.</p>
        </div>
    `;

    const footer = `
        <button class="btn btn-danger" style="width:100%; margin-bottom:8px;" onclick="confirmDeleteDocument('${projectId}','${deliverableId}','${docId}')">Apagar Ficheiro</button>
        <button class="btn btn-secondary" style="width:100%;" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Confirmar Remoção', body, footer);
}

function confirmDeleteDocument(projectId, deliverableId, docId) {
    if (removeDocument(projectId, deliverableId, docId)) {
        closeModal();
        showToast('Documento removido');
        handleRoute();
    }
}

function deleteDeliverableRequest(projectId, deliverableId) {
    const res = getDeliverable(projectId, deliverableId);
    if (!res) return;
    const del = res.deliverable;

    const body = `
        <div style="text-align:center; padding:10px 0;">
            <p style="font-size:15px; font-weight:700; margin-bottom:8px; color:#111827;">Apagar entregável "${del.name}"?</p>
            <p style="font-size:13px; color:#6b7280; line-height:1.5;">O documento e progresso associados serão removidos.</p>
        </div>
    `;

    const footer = `
        <button class="btn btn-danger" style="width:100%; margin-bottom:8px;" onclick="confirmDeleteDeliverable('${projectId}','${deliverableId}')">Apagar Entregável</button>
        <button class="btn btn-secondary" style="width:100%;" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Confirmar Remoção', body, footer);
}

function confirmDeleteDeliverable(projectId, deliverableId) {
    if (removeDeliverable(projectId, deliverableId)) {
        closeModal();
        showToast('Entregável removido');
        handleRoute();
    }
}

// ============================================================================
// VIEW MODE FUNCTIONS
// ============================================================================

function togglePhaseViewMode() {
    UI_STATE.phaseViewMode = UI_STATE.phaseViewMode === 'compact' ? 'detailed' : 'compact';
    renderProject();
}

function expandPhase(phaseKey) {
    UI_STATE.phaseViewMode = 'detailed';
    renderProject();
    // Auto-expand the phase after render
    setTimeout(() => {
        const content = document.getElementById(`content-${phaseKey}`);
        const chevron = document.getElementById(`chevron-${phaseKey}`);
        if (content && chevron) {
            content.style.display = 'block';
            chevron.style.transform = 'rotate(180deg)';
        }
    }, 100);
}