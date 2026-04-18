// ============================================================================
// ArchProject — templates.js
// Gestão de templates: listagem, visualização, edição, criação, duplicação
// ============================================================================

// ============================================================================
// TEMPLATES LIST
// ============================================================================

function renderTemplates() {
    let html = `
        <div class="content-container">
            <div class="page-header">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <h2 style="font-size:24px; font-weight:800; letter-spacing:-0.5px;">Templates de Projecto</h2>
                        <p style="font-size:13px; color:#6b7280; margin-top:4px;">${TEMPLATES.length} template${TEMPLATES.length !== 1 ? 's' : ''} disponíve${TEMPLATES.length !== 1 ? 'is' : 'l'} no sistema.</p>
                    </div>
                    <button class="btn btn-primary" onclick="openNewTemplateModal()">+ Novo Template</button>
                </div>
            </div>
            <div class="page-body">
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:24px;">
    `;

    TEMPLATES.forEach(tmpl => {
        const phaseCount = tmpl.phases.length;
        const delCount = tmpl.phases.reduce((sum, ph) => {
            const dels = ph.defaultDeliverables || ph.deliverables || [];
            return sum + dels.length;
        }, 0);
        const aprCount = tmpl.phases.reduce((sum, ph) => {
            const aprs = ph.defaultApprovals || ph.approvals || [];
            return sum + aprs.length;
        }, 0);

        html += `
            <div class="card" style="padding:24px; display:flex; flex-direction:column; border-radius:0; border-color:#eee;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <h3 style="font-size:16px; font-weight:800; margin:0; color:#111827; letter-spacing:-0.5px;">${tmpl.name}</h3>
                    </div>
                    <p style="font-size:13px; color:#6b7280; margin:0 0 20px; line-height:1.5;">${tmpl.description}</p>
                    ${isFullMode() ? (() => {
                        const count = PROJECTS.filter(p => p.templateUsed === tmpl.id).length;
                        return `<p style="font-size:11px; color:#9ca3af; margin:4px 0 0;">Usado em ${count} projecto${count !== 1 ? 's' : ''}</p>`;
                    })() : ''}
                </div>

                <div style="margin-bottom:20px;">
                    <h4 style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#9ca3af; margin:0 0 12px; display:flex; align-items:center; gap:6px;">
                        <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg></span>
                        ${phaseCount} Fases Incluídas
                    </h4>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${tmpl.phases.map(ph => `
                            <div style="display:flex; align-items:center; gap:10px; padding:6px 10px; background:#f9fafb; border:1px solid #f3f4f6;">
                                <span class="badge" style="font-size:10px; font-weight:700; background:#e5e7eb; color:#374151; border-radius:0;">${ph.abbr || ph.key?.toUpperCase()}</span>
                                <span style="font-size:12px; font-weight:600; color:#4b5563;">${ph.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-top:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:16px; border-top:1px solid #f3f4f6;">
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-primary" style="padding:6px 14px; font-size:12px; border-radius:0;" onclick="navigate('template',{id:'${tmpl.id}'})">Editar</button>
                            <button class="btn btn-secondary" style="padding:6px 14px; font-size:12px; border-radius:0;" onclick="duplicateTemplate('${tmpl.id}')">Duplicar</button>
                        </div>
                        <div style="font-size:10px; font-weight:500; color:#9ca3af; text-align:right;">
                            Criado: ${tmpl.createdAt}<br>
                            Act: ${tmpl.updatedAt}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div></div></div>`;
    document.getElementById('pageContent').innerHTML = html;
}

// ============================================================================
// TEMPLATE ACTIONS (list level)
// ============================================================================

function duplicateTemplate(templateId) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const newTmpl = {
        id: generateId(),
        name: tmpl.name + ' (cópia)',
        description: tmpl.description,
        createdAt: todayStr(),
        updatedAt: todayStr(),
        phases: JSON.parse(JSON.stringify(tmpl.phases))
    };

    TEMPLATES.push(newTmpl);
    showToast('Template duplicado');
    persistAll();
    renderTemplates();
}

function deleteTemplate(templateId) {
    const idx = TEMPLATES.findIndex(t => t.id === templateId);
    if (idx === -1) return;
    if (TEMPLATES.length <= 1) { showToast('Não é possível eliminar o último template'); return; }

    const body = `<p style="font-size:13px;">Tem a certeza que deseja eliminar o template <strong>${TEMPLATES[idx].name}</strong>? Esta acção não pode ser revertida.</p>`;
    const footer = `
        <button class="btn btn-danger" onclick="confirmDeleteTemplate('${templateId}')">Eliminar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Eliminar Template', body, footer);
}

function confirmDeleteTemplate(templateId) {
    const idx = TEMPLATES.findIndex(t => t.id === templateId);
    if (idx === -1) return;
    TEMPLATES.splice(idx, 1);
    closeModal();
    showToast('Template eliminado');
    persistAll();
    renderTemplates();
}

function openNewTemplateModal() {
    const body = `
        <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="newTmplName" placeholder="Ex: Reabilitação Urbana">
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea class="form-input" id="newTmplDesc" placeholder="Descrição do tipo de projecto..."></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Fases iniciais</label>
            <select class="form-input" id="newTmplBase">
                <option value="standard">8 fases padrão (PP → TF)</option>
                <option value="empty">Em branco (sem fases)</option>
                <option value="copy">Copiar de template existente</option>
            </select>
        </div>
        <div class="form-group" id="newTmplCopyGroup" style="display:none;">
            <label class="form-label">Copiar fases de</label>
            <select class="form-input" id="newTmplCopyFrom">
                ${TEMPLATES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
        </div>
    `;

    const footer = `
        <button class="btn btn-primary" onclick="createTemplate()">Criar Template</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Novo Template', body, footer);

    // Toggle copy group
    setTimeout(() => {
        document.getElementById('newTmplBase').addEventListener('change', function () {
            document.getElementById('newTmplCopyGroup').style.display = this.value === 'copy' ? 'block' : 'none';
        });
    }, 50);
}

function createTemplate() {
    const name = document.getElementById('newTmplName').value.trim();
    if (!name) { showToast('Nome é obrigatório'); return; }

    const base = document.getElementById('newTmplBase').value;
    let phases = [];

    if (base === 'standard') {
        phases = JSON.parse(JSON.stringify(PHASE_DEFINITIONS));
    } else if (base === 'copy') {
        const sourceId = document.getElementById('newTmplCopyFrom').value;
        const source = TEMPLATES.find(t => t.id === sourceId);
        if (source) phases = JSON.parse(JSON.stringify(source.phases));
    }
    // else: empty

    const newTmpl = {
        id: generateId(),
        name: name,
        description: document.getElementById('newTmplDesc').value.trim(),
        createdAt: todayStr(),
        updatedAt: todayStr(),
        phases: phases
    };

    TEMPLATES.push(newTmpl);
    closeModal();
    showToast('Template "' + name + '" criado');
    persistAll();
    navigate('template', { id: newTmpl.id });
}

function openUseTemplateModal(templateId) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const body = `
        <p style="font-size:13px; margin:0 0 16px;">Criar um novo projecto a partir do template <strong>${tmpl.name}</strong>.</p>
        <div class="form-group">
            <label class="form-label">Nome do Projecto</label>
            <input type="text" class="form-input" id="useTmplProjName" placeholder="Ex: Moradia Santos">
        </div>
        <div class="form-group">
            <label class="form-label">Cliente</label>
            <select class="form-input" id="useTmplClient">
                <option value="">— Seleccionar —</option>
                ${TEAM.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Localização</label>
            <input type="text" class="form-input" id="useTmplLocation" placeholder="Morada do projecto">
        </div>
    `;

    const footer = `
        <button class="btn btn-primary" onclick="createProjectFromTemplate('${templateId}')">Criar Projecto</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Usar Template', body, footer);
}

function createProjectFromTemplate(templateId) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const name = document.getElementById('useTmplProjName').value.trim();
    if (!name) { showToast('Nome do projecto é obrigatório'); return; }

    const clientId = document.getElementById('useTmplClient').value;
    const location = document.getElementById('useTmplLocation').value.trim();
    const projId = generateId();

    const phases = buildPhasesFromSource(tmpl.phases);

    const newProject = {
        id: projId,
        name: name,
        client: clientId || null,
        location: location,
        typology: '',
        area: '',
        budget: 0,
        budgetSpent: 0,
        status: 'active',
        currentPhaseKey: phases.length > 0 ? phases[0].key : null,
        templateUsed: templateId,
        createdAt: todayStr(),
        team: {
            members: [APP.currentUser.id],
            externals: [],
            clients: clientId ? [clientId] : []
        },
        phases: phases,
        visits: [],
        timeLogs: [],
        pendencias: [],
        history: [
            { date: todayStr(), user: APP.currentUser.id, action: 'Criou projecto', detail: name + ' a partir do template ' + tmpl.name, phase: null }
        ]
    };

    PROJECTS.push(newProject);
    closeModal();
    showToast('Projecto "' + name + '" criado');
    persistAll();
    updateBadges();
    navigate('projecto', { id: projId });
}

// ============================================================================
// TEMPLATE EDIT VIEW
// ============================================================================

function renderTemplateEdit(templateId) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) {
        document.getElementById('pageContent').innerHTML = `
            <div class="page-header"><h2>Template não encontrado</h2></div>
            <div class="page-body"><button class="btn btn-secondary" onclick="navigate('templates')">Voltar</button></div>
        `;
        return;
    }

    let html = `
        <!-- Header -->
        <div class="page-header" style="padding-bottom:0; border-bottom:none;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <button class="btn btn-secondary btn-sm" onclick="navigate('templates')" style="padding:4px 8px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span style="font-size:12px; color:#9a928a;">Templates</span>
                <span style="font-size:12px; color:#ccc;">›</span>
                <span style="font-size:12px; font-weight:600;">${tmpl.name}</span>
            </div>
            <div style="display:flex; align-items:flex-start; justify-content:space-between;">
                <div>
                    <h2 style="margin-bottom:4px;">${tmpl.name}</h2>
                    <p style="font-size:13px; color:#7a736b; margin:0;">${tmpl.description}</p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary btn-sm" onclick="editTemplateInfo('${tmpl.id}')">Editar Info</button>
                    <button class="btn btn-primary btn-sm" onclick="openUseTemplateModal('${tmpl.id}')">Usar em Projecto</button>
                </div>
            </div>
        </div>

        <!-- Tabs-like sub nav -->
        <div class="tabs">
            <button class="tab-btn active" style="pointer-events:none;">
                Fases e Entregáveis
                <span class="tab-count">${tmpl.phases.length}</span>
            </button>
        </div>

        <div class="page-body">
            <!-- Add phase button -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                <p style="font-size:13px; color:#7a736b; margin:0;">Edite as fases, entregáveis e aprovações deste template. As alterações aplicam-se apenas a novos projectos.</p>
                <button class="btn btn-primary btn-sm" onclick="openAddTemplatePhaseModal('${tmpl.id}')">+ Adicionar Fase</button>
            </div>
    `;

    html += `<div id="sortable-phases-container">`;
    // Render each phase
    tmpl.phases.forEach((phase, phIdx) => {
        const deliverables = phase.defaultDeliverables || phase.deliverables || [];
        const approvals = phase.defaultApprovals || phase.approvals || [];
        const depNames = (phase.dependencies || []).map(dk => {
            const dp = tmpl.phases.find(p => p.key === dk);
            return dp ? (dp.abbr || dp.key.toUpperCase()) : dk;
        }).join(', ');

        html += `
            <div class="card" draggable="true" 
                 ondragstart="dragStartTemplatePhase(event, ${phIdx})"
                 ondragover="event.preventDefault()"
                 ondrop="dropTemplatePhase(event, '${tmpl.id}', ${phIdx})"
                 style="margin-bottom:12px; overflow:hidden; cursor:move;" id="tmpl-phase-${phIdx}">
                <!-- Phase header -->
                <div class="expand-header" onclick="toggleTmplPhase(${phIdx})">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="phase-dot pending" style="width:32px; height:32px; font-size:11px;">${phase.abbr || phase.key?.toUpperCase() || (phIdx + 1)}</div>
                        <div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:14px; font-weight:700;">${phase.name}</span>
                                <span style="font-size:11px; color:#9a928a;">${deliverables.length} entregáveis · ${approvals.length} aprovações</span>
                            </div>
                            ${depNames ? `<p style="font-size:10px; color:#b0a99f; margin:2px 0 0;">Depende de: ${depNames}</p>` : ''}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button class="btn btn-danger btn-xs" onclick="event.stopPropagation(); removeTemplatePhase('${tmpl.id}',${phIdx})" title="Remover fase">✕</button>
                        <svg class="expand-chevron" id="tmpl-chevron-${phIdx}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a928a" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                </div>

                <!-- Phase content -->
                <div class="expand-content" id="tmpl-content-${phIdx}">

                    <!-- Phase info edit -->
                    <div style="padding:0 0 16px; margin-bottom:16px; border-bottom:1px solid #f0ece7;">
                        <div style="display:grid; grid-template-columns:100px 1fr; gap:10px; margin-bottom:10px; align-items:center;">
                            <label style="font-size:11px; font-weight:600; color:#7a736b;">Abreviatura</label>
                            <input type="text" class="form-input" value="${phase.abbr || ''}" maxlength="3" style="max-width:80px; font-size:12px; padding:6px 10px;"
                                   onchange="updateTemplatePhaseField('${tmpl.id}',${phIdx},'abbr',this.value.toUpperCase())">
                        </div>
                        <div style="display:grid; grid-template-columns:100px 1fr; gap:10px; margin-bottom:10px; align-items:center;">
                            <label style="font-size:11px; font-weight:600; color:#7a736b;">Nome</label>
                            <input type="text" class="form-input" value="${esc(phase.name)}" style="font-size:12px; padding:6px 10px;"
                                   onchange="updateTemplatePhaseField('${tmpl.id}',${phIdx},'name',this.value)">
                        </div>
                        <div style="display:grid; grid-template-columns:100px 1fr; gap:10px; margin-bottom:10px; align-items:start;">
                            <label style="font-size:11px; font-weight:600; color:#7a736b; padding-top:8px;">Descrição</label>
                            <textarea class="form-input" style="font-size:12px; padding:6px 10px; min-height:50px;"
                                      onchange="updateTemplatePhaseField('${tmpl.id}',${phIdx},'description',this.value)">${phase.description || ''}</textarea>
                        </div>
                        <div style="display:grid; grid-template-columns:100px 1fr; gap:10px; align-items:start;">
                            <label style="font-size:11px; font-weight:600; color:#7a736b; padding-top:8px;">Dependências</label>
                            <select multiple size="6" class="form-input" style="font-size:12px; height:auto; min-height:135px;" onchange="updateMultiDeps(this, '${tmpl.id}', ${phIdx})">
                                ${tmpl.phases.filter((p, i) => i !== phIdx).map(p => {
                                    const isChecked = (phase.dependencies || []).includes(p.key);
                                    return `<option value="${p.key}" ${isChecked ? 'selected' : ''}>${p.abbr} - ${p.name}</option>`;
                                }).join('')}
                            </select>
                            <div style="grid-column: 2; font-size:10px; color:#9a928a; margin-top:-6px;">Ctrl + Click (ou Cmd + Click) para seleccionar múltiplas fases.</div>
                        </div>
                    </div>

                    <!-- DELIVERABLES -->
                    <div style="margin-bottom:18px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                            <h4 style="font-size:12px; font-weight:700; margin:0; text-transform:uppercase; letter-spacing:0.5px; color:#7a736b;">Entregáveis (${deliverables.length})</h4>
                            <button class="btn btn-secondary btn-xs" onclick="addTemplateDeliverable('${tmpl.id}',${phIdx})">+ Adicionar</button>
                        </div>
                        ${renderTemplateDeliverables(tmpl, phIdx, deliverables)}
                    </div>

                    <!-- APPROVALS -->
                    <div>
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                            <h4 style="font-size:12px; font-weight:700; margin:0; text-transform:uppercase; letter-spacing:0.5px; color:#7a736b;">Aprovações (${approvals.length})</h4>
                            <button class="btn btn-secondary btn-xs" onclick="addTemplateApproval('${tmpl.id}',${phIdx})">+ Adicionar</button>
                        </div>
                        ${renderTemplateApprovals(tmpl, phIdx, approvals)}
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div></div>`;
    document.getElementById('pageContent').innerHTML = html;
}

let draggedPhaseIndex = null;
function dragStartTemplatePhase(event, index) {
    draggedPhaseIndex = index;
    // Minimize visual footprint while dragging (optional)
    event.dataTransfer.effectAllowed = 'move';
}
function dropTemplatePhase(event, templateId, targetIndex) {
    event.preventDefault();
    if (draggedPhaseIndex === null || draggedPhaseIndex === targetIndex) return;
    
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    // Remove from old
    const item = tmpl.phases.splice(draggedPhaseIndex, 1)[0];
    // Insert at new
    tmpl.phases.splice(targetIndex, 0, item);
    
    draggedPhaseIndex = null;
    persistAll();
    showToast('Ordem da fase actualizada');
    renderTemplateEdit(templateId);
}

function toggleTmplPhase(phIdx) {
    const content = document.getElementById('tmpl-content-' + phIdx);
    const chevron = document.getElementById('tmpl-chevron-' + phIdx);
    if (!content) return;
    content.classList.toggle('open');
    chevron?.classList.toggle('open');
}

// ============================================================================
// TEMPLATE DELIVERABLES
// ============================================================================

function renderTemplateDeliverables(tmpl, phIdx, deliverables) {
    if (deliverables.length === 0) {
        return `<p style="font-size:12px; color:#b0a99f;">Nenhum entregável definido. Adicione entregáveis para este template.</p>`;
    }

    let html = `<div ondragover="event.preventDefault();">`;
    deliverables.forEach((del, delIdx) => {
        html += `
            <div draggable="true" ondragstart="dragDelStart(event, '${tmpl.id}', ${phIdx}, ${delIdx})" ondragover="event.preventDefault()" ondrop="dragDelDrop(event, '${tmpl.id}', ${phIdx}, ${delIdx})"
                 style="display:flex; align-items:center; gap:10px; padding:8px 12px; border:1px solid #f0ece7; border-radius:6px; margin-bottom:4px; background:#fafaf9; cursor:grab;">
                
                <div style="color:#c5b9a8; display:flex; align-items:center;" title="Arrastar para reordenar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                
                <div style="flex:1; min-width:0;">
                    <input type="text" class="form-input" value="${esc(del.name)}" style="font-size:12px; padding:4px 8px; border:none; background:transparent; font-weight:500;"
                           onchange="updateTemplateDeliverable('${tmpl.id}',${phIdx},${delIdx},'name',this.value)">
                    <input type="text" class="form-input" value="${del.description || ''}" placeholder="Descrição..." style="font-size:11px; padding:2px 8px; border:none; background:transparent; color:#7a736b;"
                           onchange="updateTemplateDeliverable('${tmpl.id}',${phIdx},${delIdx},'description',this.value)">
                </div>
                
                <div style="display:flex; align-items:center; gap:20px; flex-shrink:0; padding-right:12px; border-right:1px solid #e5e7eb; margin-right:4px;">
                    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;" title="Permite que a Equipa interna (Membros) aceda a este entregável.">
                        <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:#6b7280;">Equipa</span>
                        <div style="position:relative; width:28px; height:16px; background:${(del.visibility || ['admin', 'member']).includes('member') ? '#3b82f6' : '#d1d5db'}; border-radius:10px; transition:background 0.2s;">
                            <div style="position:absolute; top:2px; left:${(del.visibility || ['admin', 'member']).includes('member') ? '14px' : '2px'}; width:12px; height:12px; background:white; border-radius:50%; transition:left 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.1);"></div>
                            <input type="checkbox" style="opacity:0; position:absolute; width:100%; height:100%; cursor:pointer; margin:0;" ${(del.visibility || ['admin', 'member']).includes('member') ? 'checked' : ''} 
                                   onchange="toggleTemplateDeliverableVisibility('${tmpl.id}', ${phIdx}, ${delIdx}, 'member', this.checked)">
                        </div>
                    </label>
                    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;" title="Permite que Especialidades (Externos) acedam a este entregável.">
                        <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:#6b7280;">Especialidades</span>
                        <div style="position:relative; width:28px; height:16px; background:${(del.visibility || []).includes('external') ? '#f59e0b' : '#d1d5db'}; border-radius:10px; transition:background 0.2s;">
                            <div style="position:absolute; top:2px; left:${(del.visibility || []).includes('external') ? '14px' : '2px'}; width:12px; height:12px; background:white; border-radius:50%; transition:left 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.1);"></div>
                            <input type="checkbox" style="opacity:0; position:absolute; width:100%; height:100%; cursor:pointer; margin:0;" ${(del.visibility || []).includes('external') ? 'checked' : ''} 
                                   onchange="toggleTemplateDeliverableVisibility('${tmpl.id}', ${phIdx}, ${delIdx}, 'external', this.checked)">
                        </div>
                    </label>
                    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;" title="Permite que o Cliente aceda aos documentos anexados a este entregável.">
                        <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:#6b7280;">Cliente</span>
                        <div style="position:relative; width:28px; height:16px; background:${(del.visibility || []).includes('client') ? '#10b981' : '#d1d5db'}; border-radius:10px; transition:background 0.2s;">
                            <div style="position:absolute; top:2px; left:${(del.visibility || []).includes('client') ? '14px' : '2px'}; width:12px; height:12px; background:white; border-radius:50%; transition:left 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.1);"></div>
                            <input type="checkbox" style="opacity:0; position:absolute; width:100%; height:100%; cursor:pointer; margin:0;" ${(del.visibility || []).includes('client') ? 'checked' : ''} 
                                   onchange="toggleTemplateDeliverableVisibility('${tmpl.id}', ${phIdx}, ${delIdx}, 'client', this.checked)">
                        </div>
                    </label>
                </div>

                <div style="display:flex; gap:4px; flex-shrink:0;">
                    <button class="btn btn-danger btn-xs" onclick="removeTemplateDeliverable('${tmpl.id}',${phIdx},${delIdx})" style="padding:2px 6px;">✕</button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

function addTemplateDeliverable(templateId, phIdx) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultDeliverables || phase.deliverables;
    if (!arr) {
        phase.defaultDeliverables = [];
    }

    const target = phase.defaultDeliverables || phase.deliverables;
    target.push({ name: 'Novo entregável', description: '' });

    tmpl.updatedAt = todayStr();
    showToast('Entregável adicionado');
    persistAll();
    renderTemplateEdit(templateId);

    // Re-expand the phase
    setTimeout(() => toggleTmplPhase(phIdx), 50);
}

function updateTemplateDeliverable(templateId, phIdx, delIdx, field, value) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultDeliverables || phase.deliverables;
    if (!arr || !arr[delIdx]) return;

    arr[delIdx][field] = value;
    tmpl.updatedAt = todayStr();
    persistAll();
}

function toggleTemplateDeliverableVisibility(templateId, phIdx, delIdx, role, isVisible) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultDeliverables || phase.deliverables;
    if (!arr || !arr[delIdx]) return;

    let visibility = arr[delIdx].visibility || ['admin', 'member'];
    
    if (isVisible && !visibility.includes(role)) {
        visibility.push(role);
    } else if (!isVisible && visibility.includes(role)) {
        visibility = visibility.filter(v => v !== role);
    }

    arr[delIdx].visibility = visibility;
    tmpl.updatedAt = todayStr();
    persistAll();
    
    renderTemplateEdit(templateId);
    setTimeout(() => toggleTmplPhase(phIdx), 50);
}

function removeTemplateDeliverable(templateId, phIdx, delIdx) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultDeliverables || phase.deliverables;
    if (!arr) return;

    arr.splice(delIdx, 1);
    tmpl.updatedAt = todayStr();
    showToast('Entregável removido');
    persistAll();
    renderTemplateEdit(templateId);
    setTimeout(() => toggleTmplPhase(phIdx), 50);
}

function moveTemplateDeliverable(templateId, phIdx, delIdx, direction) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultDeliverables || phase.deliverables;
    if (!arr) return;

    const newIdx = delIdx + direction;
    if (newIdx < 0 || newIdx >= arr.length) return;

    [arr[delIdx], arr[newIdx]] = [arr[newIdx], arr[delIdx]];
    tmpl.updatedAt = todayStr();
    renderTemplateEdit(templateId);
    setTimeout(() => toggleTmplPhase(phIdx), 50);
}

// DRAG AND DROP DELIVERABLES
let DRAG_DEL = null;

function dragDelStart(e, tmplId, phIdx, delIdx) {
    DRAG_DEL = { tmplId, phIdx, delIdx };
    e.dataTransfer.effectAllowed = 'move';
}

function dragDelDrop(e, tmplId, phIdx, dropIdx) {
    e.preventDefault();
    if (!DRAG_DEL || DRAG_DEL.tmplId !== tmplId || DRAG_DEL.phIdx !== phIdx || DRAG_DEL.delIdx === dropIdx) return;
    
    const tmpl = TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;
    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultDeliverables || phase.deliverables;
    
    const item = arr.splice(DRAG_DEL.delIdx, 1)[0];
    arr.splice(dropIdx, 0, item);
    
    tmpl.updatedAt = todayStr();
    persistAll();
    renderTemplateEdit(tmplId);
    
    // Automatically re-expand the phase content after rendering
    setTimeout(() => toggleTmplPhase(phIdx), 50);
}

// ============================================================================
// TEMPLATE APPROVALS
// ============================================================================

function renderTemplateApprovals(tmpl, phIdx, approvals) {
    if (approvals.length === 0) {
        return `<p style="font-size:12px; color:#b0a99f;">Nenhuma aprovação definida.</p>`;
    }

    let html = '';
    approvals.forEach((apr, aprIdx) => {
        html += `
            <div style="display:flex; align-items:center; gap:10px; padding:8px 12px; border:1px solid #f0ece7; border-radius:6px; margin-bottom:4px; background:#fafaf9;">
                <div style="flex:1; display:flex; align-items:center; gap:10px; min-width:0;">
                    <select class="form-input" value="${apr.type}" style="font-size:11px; padding:4px 8px; max-width:140px; border:none; background:transparent;"
                            onchange="updateTemplateApproval('${tmpl.id}',${phIdx},${aprIdx},'type',this.value)">
                        <option value="internal" ${apr.type === 'internal' ? 'selected' : ''}>Interna</option>
                        <option value="client" ${apr.type === 'client' ? 'selected' : ''}>Cliente</option>
                        <option value="council" ${apr.type === 'council' ? 'selected' : ''}>Câmara</option>
                        <option value="specialties" ${apr.type === 'specialties' ? 'selected' : ''}>Especialidades</option>
                    </select>
                    <input type="text" class="form-input" value="${esc(apr.name)}" style="font-size:12px; padding:4px 8px; border:none; background:transparent; flex:1; font-weight:500;"
                           onchange="updateTemplateApproval('${tmpl.id}',${phIdx},${aprIdx},'name',this.value)">
                </div>
                <button class="btn btn-danger btn-xs" onclick="removeTemplateApproval('${tmpl.id}',${phIdx},${aprIdx})" style="padding:2px 6px;">✕</button>
            </div>
        `;
    });

    return html;
}

function addTemplateApproval(templateId, phIdx) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    if (!phase.defaultApprovals && !phase.approvals) {
        phase.defaultApprovals = [];
    }

    const target = phase.defaultApprovals || phase.approvals;
    target.push({ type: 'internal', name: 'Nova aprovação' });

    tmpl.updatedAt = todayStr();
    showToast('Aprovação adicionada');
    persistAll();
    renderTemplateEdit(templateId);
    setTimeout(() => toggleTmplPhase(phIdx), 50);
}

function updateTemplateApproval(templateId, phIdx, aprIdx, field, value) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultApprovals || phase.approvals;
    if (!arr || !arr[aprIdx]) return;

    arr[aprIdx][field] = value;
    tmpl.updatedAt = todayStr();
    persistAll();
}

function removeTemplateApproval(templateId, phIdx, aprIdx) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    const arr = phase.defaultApprovals || phase.approvals;
    if (!arr) return;

    arr.splice(aprIdx, 1);
    tmpl.updatedAt = todayStr();
    showToast('Aprovação removida');
    persistAll();
    renderTemplateEdit(templateId);
    setTimeout(() => toggleTmplPhase(phIdx), 50);
}

// ============================================================================
// TEMPLATE PHASE MANAGEMENT
// ============================================================================

function updateTemplatePhaseField(templateId, phIdx, field, value) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;
    tmpl.phases[phIdx][field] = value;
    tmpl.updatedAt = todayStr();
    persistAll();
}

function toggleTemplatePhaseDep(templateId, phIdx, depKey, checked) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;

    const phase = tmpl.phases[phIdx];
    if (!phase.dependencies) phase.dependencies = [];

    if (checked && !phase.dependencies.includes(depKey)) {
        phase.dependencies.push(depKey);
    } else if (!checked) {
        phase.dependencies = phase.dependencies.filter(d => d !== depKey);
    }

    tmpl.updatedAt = todayStr();
    persistAll();
}

function updateMultiDeps(selectElem, templateId, phIdx) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl || !tmpl.phases[phIdx]) return;
    
    const selectedKeys = Array.from(selectElem.selectedOptions).map(opt => opt.value);
    tmpl.phases[phIdx].dependencies = selectedKeys;
    tmpl.updatedAt = todayStr();
    persistAll();
}

function moveTemplatePhase(templateId, phIdx, direction) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const newIdx = phIdx + direction;
    if (newIdx < 0 || newIdx >= tmpl.phases.length) return;

    [tmpl.phases[phIdx], tmpl.phases[newIdx]] = [tmpl.phases[newIdx], tmpl.phases[phIdx]];

    // Update order fields
    tmpl.phases.forEach((ph, i) => { ph.order = i + 1; });
    tmpl.updatedAt = todayStr();
    persistAll();
    showToast('Fase reordenada');
    renderTemplateEdit(templateId);
}

function removeTemplatePhase(templateId, phIdx) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const phase = tmpl.phases[phIdx];
    const body = `<p style="font-size:13px;">Tem a certeza que deseja remover a fase <strong>${phase.name}</strong> deste template? Todos os entregáveis e aprovações desta fase serão eliminados.</p>`;
    const footer = `
        <button class="btn btn-danger" onclick="confirmRemoveTemplatePhase('${templateId}',${phIdx})">Remover</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Remover Fase', body, footer);
}

function confirmRemoveTemplatePhase(templateId, phIdx) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const removedKey = tmpl.phases[phIdx].key;
    tmpl.phases.splice(phIdx, 1);

    // Remove from dependencies
    tmpl.phases.forEach(ph => {
        if (ph.dependencies) {
            ph.dependencies = ph.dependencies.filter(d => d !== removedKey);
        }
    });

    // Re-order
    tmpl.phases.forEach((ph, i) => { ph.order = i + 1; });
    tmpl.updatedAt = todayStr();

    closeModal();
    showToast('Fase removida do template');
    persistAll();
    renderTemplateEdit(templateId);
}

function openAddTemplatePhaseModal(templateId) {
    const body = `
        <div class="form-group">
            <label class="form-label">Abreviatura (2-3 letras)</label>
            <input type="text" class="form-input" id="newTmplPhaseAbbr" placeholder="Ex: EX" maxlength="3">
        </div>
        <div class="form-group">
            <label class="form-label">Chave (identificador único, sem espaços)</label>
            <input type="text" class="form-input" id="newTmplPhaseKey" placeholder="Ex: extra">
        </div>
        <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="newTmplPhaseName" placeholder="Ex: Fase Extra">
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea class="form-input" id="newTmplPhaseDesc" placeholder="Descrição da fase..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="addTemplatePhase('${templateId}')">Adicionar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Adicionar Fase ao Template', body, footer);
}

function addTemplatePhase(templateId) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const abbr = document.getElementById('newTmplPhaseAbbr').value.trim().toUpperCase();
    const key = document.getElementById('newTmplPhaseKey').value.trim().toLowerCase().replace(/\s+/g, '_') || abbr.toLowerCase();
    const name = document.getElementById('newTmplPhaseName').value.trim();

    if (!abbr || !name) { showToast('Abreviatura e nome são obrigatórios'); return; }

    // Check for duplicate keys
    if (tmpl.phases.some(ph => ph.key === key)) {
        showToast('Já existe uma fase com essa chave');
        return;
    }

    tmpl.phases.push({
        key: key,
        abbr: abbr,
        name: name,
        description: document.getElementById('newTmplPhaseDesc').value.trim(),
        order: tmpl.phases.length + 1,
        dependencies: [],
        defaultDeliverables: [],
        defaultApprovals: []
    });

    tmpl.updatedAt = todayStr();
    closeModal();
    showToast('Fase adicionada ao template');
    persistAll();
    renderTemplateEdit(templateId);
}

// ============================================================================
// TEMPLATE INFO EDIT
// ============================================================================

function editTemplateInfo(templateId) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const body = `
        <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="editTmplName" value="${esc(tmpl.name)}">
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea class="form-input" id="editTmplDesc">${esc(tmpl.description)}</textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="saveTemplateInfo('${templateId}')">Guardar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Editar Template', body, footer);
}

function saveTemplateInfo(templateId) {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const name = document.getElementById('editTmplName').value.trim();
    if (!name) { showToast('Nome é obrigatório'); return; }

    tmpl.name = name;
    tmpl.description = document.getElementById('editTmplDesc').value.trim();
    tmpl.updatedAt = todayStr();

    closeModal();
    showToast('Template actualizado');
    persistAll();
    renderTemplateEdit(templateId);
}
