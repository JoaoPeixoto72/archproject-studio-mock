function renderProjectDocuments(proj) {
    let allDocs = [];
    proj.phases.forEach(phase => {
        phase.deliverables.filter(del => canUserSeeDeliverable(APP.currentUser.id, del, proj)).forEach(del => {
            (del.documents || []).forEach(doc => {
                allDocs.push({
                    ...doc,
                    deliverableName: del.name,
                    deliverableId: del.id,
                    phaseKey: phase.key,
                    phaseName: phase.name,
                    phaseAbbr: phase.abbr,
                    delStatus: del.status,
                    docStatus: doc.status || 'draft',
                    fileType: doc.fileType || 'document'
                });
            });
        });
    });

    let html = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:700; margin:0;">Biblioteca de Ficheiros (${allDocs.length})</h3>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="openUploadModal('${proj.id}', 'document')">+ Carregar Documento</button>
                <button class="btn btn-secondary btn-sm" onclick="openUploadModal('${proj.id}', 'photo')">+ Carregar Fotografia</button>
            </div>
        </div>
    `;

    // Filtros
    html += `<div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center;">
        <input type="text" class="form-input" placeholder="Pesquisar ficheiro..." style="flex:1; min-width:200px;"
            value="${esc(UI_STATE.docFilter.search || '')}"
            oninput="UI_STATE.docFilter.search=this.value; renderProject()">
        <select class="form-input" style="max-width:160px;" onchange="UI_STATE.docFilter.type=this.value; renderProject()">
            <option value="">Todos os Tipos</option>
            <option value="document" ${UI_STATE.docFilter.type==='document'?'selected':''}>Documentos</option>
            <option value="photo" ${UI_STATE.docFilter.type==='photo'?'selected':''}>Fotografias</option>
        </select>
        <select class="form-input" style="max-width:160px;" onchange="UI_STATE.docFilter.phase=this.value; renderProject()">
            <option value="">Todas as fases</option>
            ${proj.phases.map(ph => `<option value="${ph.key}" ${UI_STATE.docFilter.phase===ph.key?'selected':''}>${esc(ph.abbr)}</option>`).join('')}
        </select>
    </div>`;

    // Aplicar filtros
    let filtered = allDocs;
    if (UI_STATE.docFilter.search) {
        const q = UI_STATE.docFilter.search.toLowerCase();
        filtered = filtered.filter(d => 
            (d.filename||'').toLowerCase().includes(q) || 
            (d.deliverableName||'').toLowerCase().includes(q) ||
            (d.notes||'').toLowerCase().includes(q)
        );
    }
    if (UI_STATE.docFilter.type) {
        filtered = filtered.filter(d => d.fileType === UI_STATE.docFilter.type);
    }
    if (UI_STATE.docFilter.phase) {
        filtered = filtered.filter(d => d.phaseKey === UI_STATE.docFilter.phase);
    }

    if (filtered.length === 0) {
        html += `<div class="empty-state"><p>Nenhum ficheiro encontrado.</p></div>`;
        return html;
    }

    // Group by phase
    const grouped = {};
    filtered.forEach(doc => {
        if (!grouped[doc.phaseKey]) grouped[doc.phaseKey] = { name: doc.phaseName, abbr: doc.phaseAbbr, docs: [] };
        grouped[doc.phaseKey].docs.push(doc);
    });

    Object.entries(grouped).forEach(([phaseKey, group]) => {
        html += `
            <div style="margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    <span class="badge bg-blue-50 text-blue-700" style="font-size:11px;">${group.abbr}</span>
                    <h4 style="font-size:13px; font-weight:700; margin:0;">${group.name}</h4>
                    <span style="font-size:11px; color:#9a928a;">(${group.docs.length})</span>
                </div>
                <div class="card" style="overflow:hidden;">
        `;

        group.docs.forEach((doc, i) => {
            const isPhoto = doc.fileType === 'photo';
            const icon = isPhoto ? '📷' : '📄';
            
            html += `
                <div style="display:flex; align-items:center; gap:14px; padding:12px 18px; ${i < group.docs.length - 1 ? 'border-bottom:1px solid #f0ece7;' : ''} cursor:pointer; transition:background 0.15s;"
                     onmouseenter="this.style.background='#f9f8f6'" onmouseleave="this.style.background='transparent'">
                    <div style="width:32px; height:32px; background:#f3f4f6; border-radius:4px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:16px;">
                        ${icon}
                    </div>
                    <div style="flex:1; min-width:0;">
                        <p style="font-size:13px; font-weight:600; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${doc.filename}">${doc.filename}</p>
                        <p style="font-size:11px; color:#9a928a; margin:2px 0 0;">${doc.deliverableName} · v${doc.version} · ${doc.uploadedAt}</p>
                    </div>
                    ${!isPhoto ? `<span class="badge ${getDocStatusColor(doc.docStatus)}" style="font-size:9px; font-weight:800; text-transform:uppercase; flex-shrink:0;">${getDocStatusLabel(doc.docStatus)}</span>` : ''}
                    <div style="display:flex; gap:6px; flex-shrink:0;">
                        <button class="btn btn-secondary btn-xs" style="padding:4px 8px; font-size:9px;" onclick="openDocPreviewModal('${proj.id}','${doc.deliverableId}','${doc.id}')">Ver</button>
                        <button class="btn btn-secondary btn-xs" style="padding:4px 8px; font-size:9px;" onclick="openDocVersionsModal('${proj.id}','${doc.deliverableId}','${doc.id}')">Histórico</button>
                        <button class="btn btn-secondary btn-xs" style="padding:4px 8px; font-size:9px;" onclick="openUploadModal('${proj.id}', '${doc.fileType}', '${doc.id}')">Nova Versão</button>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    return html;
}

// ── UPLOAD UNIFICADO ── 

function openUploadModal(projectId, defaultType, replaceDocId = null) {
    const proj = getProject(projectId);
    if (!proj) return;

    let targetDelId = '';
    let existingDoc = null;

    if (replaceDocId) {
        // Find existing to prefill target
        proj.phases.forEach(ph => {
            ph.deliverables.forEach(del => {
                const doc = del.documents.find(d => d.id === replaceDocId);
                if (doc) {
                    targetDelId = `${ph.key}|${del.id}`;
                    existingDoc = doc;
                }
            });
        });
    }

    let options = '';
    proj.phases.forEach(ph => {
        options += `<optgroup label="${ph.name}">`;
        ph.deliverables.forEach(del => {
            const val = `${ph.key}|${del.id}`;
            options += `<option value="${val}" ${targetDelId === val ? 'selected' : ''}>${del.name}</option>`;
        });
        options += `</optgroup>`;
    });

    const body = `
        <div class="form-group">
            <label class="form-label">Entregável Destino</label>
            <select class="form-input" id="uploadGlobalTarget">${options}</select>
        </div>
        <div class="form-group">
            <label class="form-label">Tipo de Ficheiro</label>
            <select class="form-input" id="uploadGlobalType" ${replaceDocId ? 'disabled' : ''}>
                <option value="document" ${defaultType === 'document' ? 'selected' : ''}>Documento</option>
                <option value="photo" ${defaultType === 'photo' ? 'selected' : ''}>Fotografia</option>
            </select>
        </div>
        ${existingDoc ? `
            <div style="background:#fef3c7; padding:10px; border-radius:4px; margin-bottom:16px; font-size:11px; color:#92400e; border:1px solid #fde68a;">
                Está a carregar a <strong>versão ${existingDoc.version + 1}</strong> de ${esc(existingDoc.filename)}.
            </div>
        ` : ''}
        <div class="form-group">
            <label class="form-label">Ficheiro</label>
            <input type="file" class="form-input" id="uploadGlobalFile" style="padding:8px;">
        </div>
        <div class="form-group">
            <label class="form-label">Nota da versão / Descrição</label>
            <input type="text" class="form-input" id="uploadGlobalNotes" placeholder="Ex: Revisto após reunião...">
        </div>
        <div class="form-group">
            <label class="form-label">Visibilidade</label>
            <div style="display:flex; gap:14px; flex-wrap:wrap;">
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="uploadVis" value="admin" checked> Gabinete
                </label>
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="uploadVis" value="member" checked> Membros
                </label>
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="uploadVis" value="client"> Cliente
                </label>
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="uploadVis" value="external"> Externo
                </label>
            </div>
        </div>
        <input type="hidden" id="uploadGlobalReplaceId" value="${replaceDocId || ''}">
    `;
    const footer = `
        <button class="btn btn-primary" onclick="confirmGlobalUpload('${proj.id}')">Carregar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal(replaceDocId ? 'Nova Versão' : 'Carregar Ficheiro', body, footer);
}

function confirmGlobalUpload(projectId) {
    const target = document.getElementById('uploadGlobalTarget').value;
    if (!target) return;
    const [phaseKey, delId] = target.split('|');
    const type = document.getElementById('uploadGlobalType').value;
    const notes = document.getElementById('uploadGlobalNotes').value.trim();
    const fileInput = document.getElementById('uploadGlobalFile');
    const replaceId = document.getElementById('uploadGlobalReplaceId').value;
    
    const visibility = Array.from(document.querySelectorAll('.uploadVis:checked')).map(cb => cb.value);

    let filename, size;
    if (fileInput.files.length > 0) {
        filename = fileInput.files[0].name;
        size = (fileInput.files[0].size / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
        filename = (type === 'photo' ? "foto_" : "doc_") + Date.now().toString().slice(-4) + (type==='photo'?'.jpg':'.pdf');
        size = '1.2 MB';
    }

    uploadDocumentToDeliverable(projectId, phaseKey, delId, {
        filename, 
        size, 
        notes, 
        status: 'draft', // fallback
        replaceDocId: replaceId || null,
        fileType: type,
        visibility: visibility
    });

    closeModal();
    showToast('Ficheiro carregado com sucesso');
    handleRoute();
}

// ── PREVIEW E HISTÓRICO ──

function openDocPreviewModal(projectId, deliverableId, docId) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return;
    const doc = result.deliverable.documents.find(d => d.id === docId);
    if (!doc) return;

    const fileExt = (doc.filename || '').split('.').pop().toLowerCase();
    let previewHtml = '';

    if (['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
        previewHtml = `
            <div style="width:100%; height:400px; background:#f3f4f6; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
                <div style="text-align:center;">
                    <span style="font-size:32px;">${doc.fileType === 'photo' ? '🖼️' : '📄'}</span>
                    <p style="font-size:12px; color:#9ca3af; margin:8px 0 0;">Preview de ${fileExt.toUpperCase()}</p>
                </div>
            </div>
        `;
    } else {
        previewHtml = `
            <div style="width:100%; padding:20px; background:#f9fafb; border-radius:8px; margin-bottom:16px; text-align:center;">
                <p style="font-size:12px; color:#9ca3af; margin:0;">Tipo de ficheiro não suportado para preview</p>
            </div>
        `;
    }

    const body = `
        <div style="margin-bottom:16px;">
            <h4 style="font-size:13px; font-weight:700; margin:0 0 8px;">${doc.filename}</h4>
            <p style="font-size:11px; color:#9ca3af; margin:0;">v${doc.version} · ${doc.uploadedAt}</p>
        </div>
        ${previewHtml}
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="showToast('Download iniciado...')">Download</button>
        <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
    `;

    openModal('Visualizar — ' + doc.filename, body, footer);
}

function openDocVersionsModal(projectId, deliverableId, docId) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return;
    const doc = result.deliverable.documents.find(d => d.id === docId);
    if (!doc) return;

    const versions = doc.versions || [];
    const isPhoto = doc.fileType === 'photo';

    let body = `
        <div style="margin-bottom:16px;">
            <h4 style="font-size:13px; font-weight:700; margin:0 0 8px;">${doc.filename}</h4>
            ${!isPhoto ? `<p style="font-size:11px; color:#9ca3af; margin:0;">Estado actual: <span class="badge ${getDocStatusColor(doc.status || 'draft')}" style="font-size:9px;">${getDocStatusLabel(doc.status || 'draft')}</span></p>` : ''}
        </div>

        ${!isPhoto ? `
        <div style="margin-bottom:16px;">
            <label class="form-label">Alterar Estado</label>
            <select class="form-input" onchange="updateDocStatus('${projectId}','${deliverableId}','${docId}', this.value)">
                <option value="draft" ${(doc.status || 'draft') === 'draft' ? 'selected' : ''}>Rascunho</option>
                <option value="in-review" ${(doc.status || 'draft') === 'in-review' ? 'selected' : ''}>Em Revisão</option>
                <option value="shared" ${(doc.status || 'draft') === 'shared' ? 'selected' : ''}>Partilhado</option>
                <option value="approved" ${(doc.status || 'draft') === 'approved' ? 'selected' : ''}>Aprovado</option>
                <option value="obsolete" ${(doc.status || 'draft') === 'obsolete' ? 'selected' : ''}>Obsoleto</option>
            </select>
        </div>
        ` : ''}

        <div style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 style="font-size:12px; font-weight:700; margin:0;">Histórico de Versões (${versions.length})</h4>
                <button class="btn btn-secondary btn-xs" onclick="openUploadModal('${projectId}','${doc.fileType}','${doc.id}')">+ Nova Versão</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; max-height:300px; overflow-y:auto;">
                ${versions.length > 0 ? versions.slice().reverse().map(v => `
                    <div style="padding:10px; background:#f9fafb; border-radius:4px; border-left:2px solid #e5e7eb;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11px; font-weight:700; color:#111827;">v${v.version}</span>
                            <span style="font-size:10px; color:#9ca3af;">${v.date}</span>
                        </div>
                        <p style="font-size:10px; color:#111827; margin:0 0 4px;">Ficheiro: ${v.filename}</p>
                        <p style="font-size:10px; color:#6b7280; margin:0;">Por: ${getPersonName(v.uploadedBy)}</p>
                        ${v.notes ? `<p style="font-size:10px; color:#7a736b; margin:4px 0 0; font-style:italic;">"${v.notes}"</p>` : ''}
                    </div>
                `).join('') : '<p style="font-size:11px; color:#9ca3af; text-align:center; padding:20px 0;">Sem versões antigas.</p>'}
            </div>
        </div>
        
        <div style="margin-top:20px; border-top:1px solid #f0ece7; padding-top:16px; text-align:right;">
             <button class="btn btn-secondary btn-xs" style="color:#ef4444;" onclick="deleteDocumentRequest('${projectId}','${deliverableId}','${docId}')">Apagar Ficheiro</button>
        </div>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
    `;

    openModal('Histórico — ' + doc.filename, body, footer);
}




// ============================================================================
// TAB 4: OBRA E VISITAS
// ============================================================================

// printSiteVisitReport está implementado em project-visits.js



