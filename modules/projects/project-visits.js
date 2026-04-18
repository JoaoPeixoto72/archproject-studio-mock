function renderProjectVisits(proj) {
    let html = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:700; margin:0;">Obra e Visitas</h3>
            <button class="btn btn-primary btn-sm" onclick="openAddVisitModal('${proj.id}')">+ Registar Visita</button>
        </div>
    `;

    if (proj.visits.length === 0) {
        html += `<div class="empty-state"><p>Nenhuma visita registada.</p></div>`;
        return html;
    }

    proj.visits.slice().reverse().forEach(visit => {
        const participants = (visit.participants || []).map(id => getPersonName(id)).join(', ');
        const openActions = (visit.actions || []).filter(a => a.status !== 'done').length;

        html += `
            <div class="card" style="padding:20px; margin-bottom:14px; ${visit.status === 'scheduled' ? 'border-left:3px solid #2563eb;' : ''}">
                <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px;">
                    <div>
                        <p style="font-size:15px; font-weight:700; margin:0;">${visit.date}</p>
                        <p style="font-size:12px; color:#9a928a; margin:3px 0 0;">Participantes: ${participants}</p>
                    </div>
                    ${openActions > 0 ? `<span class="badge bg-orange-100 text-orange-800">${openActions} acção${openActions > 1 ? 'ões' : ''} pendente${openActions > 1 ? 's' : ''}</span>` : ''}
                </div>
                ${visit.status === 'scheduled' ? `<span style="font-size:10px; font-weight:800; color:#2563eb; background:#eff6ff; padding:2px 8px; border:1px solid #bfdbfe; margin-bottom:8px; display:inline-block;">Agendada</span>` : ''}
                <p style="font-size:13px; color:#5a534b; margin:0 0 12px;">${esc(visit.notes)}</p>

                ${(visit.photos || []).length > 0 ? `
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                        ${visit.photos.map(ph => `
                            <div style="width:80px; height:60px; background:#e8e4df; border:1px solid #d1ccc5; border-radius:4px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b0a99f" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                <button style="position:absolute; top:2px; right:2px; width:16px; height:16px; background:rgba(239, 68, 68, 0.9); color:white; border:none; border-radius:2px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;" 
                                        onclick="removePhoto('${proj.id}','${visit.id}','${ph.id}')">×</button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Actions -->
                ${(visit.actions || []).length > 0 ? `
                    <div style="border-top:1px solid #f0ece7; padding-top:10px;">
                        <p style="font-size:11px; font-weight:600; color:#7a736b; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px;">Acções</p>
                        ${visit.actions.map(action => `
                            <div style="display:flex; align-items:center; gap:8px; padding:4px 0; font-size:12px;">
                                <input type="checkbox" ${action.status === 'done' ? 'checked' : ''} onchange="toggleVisitAction('${proj.id}','${visit.id}','${action.id}',this.checked)">
                                <span style="${action.status === 'done' ? 'text-decoration:line-through; color:#b0a99f;' : ''}">${action.description}</span>
                                <span style="color:#b0a99f; margin-left:auto;">${getPersonName(action.responsible)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:8px;">
                    <button class="btn btn-secondary btn-xs" style="border-radius:0;" onclick="openAddPhotosToVisitModal('${proj.id}', '${visit.id}')">
                        + Fotos
                    </button>
                    ${isFullMode() && visit.status === 'scheduled' ? `
                    <button class="btn btn-primary btn-xs" onclick="markVisitCompleted('${proj.id}','${visit.id}')">Marcar como Realizada</button>
                    ` : ''}
                    <button class="btn btn-secondary btn-xs" style="border-radius:0;" onclick="printSiteVisitReport('${proj.id}', '${visit.id}')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Imprimir Relatório PDF
                    </button>
                </div>
            </div>
        `;
    });

    return html;
}

function toggleVisitAction(projectId, visitId, actionId, checked) {
    updateVisitAction(projectId, visitId, actionId, checked);
    showToast(checked ? 'Acção concluída' : 'Acção reaberta');
}

function markVisitCompleted(projectId, visitId) {
    const proj = getProject(projectId);
    if (!proj) return;
    updateVisitStatus(projectId, visitId, 'completed');
    showToast('Visita marcada como realizada');
    handleRoute();
}

function openAddVisitModal(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;

    const allPeople = [...TEAM.members, ...TEAM.externals];
    let checkboxes = allPeople.map(p => `
        <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
            <input type="checkbox" class="visitParticipant" value="${p.id}"> ${p.name}
        </label>
    `).join('');

    const body = `
        ${isFullMode() ? `
        <div class="form-group">
            <label class="form-label">Tipo de Visita</label>
            <select class="form-input" id="visitType">
                <option value="completed">Visita realizada</option>
                <option value="scheduled">Visita agendada</option>
            </select>
        </div>
        ` : ''}
        <div class="form-group">
            <label class="form-label">Data</label>
            <input type="date" class="form-input" id="visitDate" value="${todayStr()}">
        </div>
        <div class="form-group">
            <label class="form-label">Participantes</label>
            <div style="display:flex; flex-direction:column; gap:6px; max-height:150px; overflow-y:auto; padding:8px; border:1px solid #e2ddd7; border-radius:8px;">
                ${checkboxes}
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-input" id="visitNotes" placeholder="Observações da visita..."></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Acções resultantes (uma por linha)</label>
            <textarea class="form-input" id="visitActions" placeholder="Verificar impermeabilização&#10;Confirmar cotas com empreiteiro"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Fotografias</label>
            <input type="file" class="form-input" id="visitPhotos" multiple accept="image/*" style="padding:8px;">
            <p style="font-size:10px; color:#9ca3af; margin-top:4px;">Seleccione uma ou mais fotos da visita.</p>
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="addVisit('${projectId}')">Registar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Registar Visita à Obra', body, footer);
}

function addVisit(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;

    const participants = Array.from(document.querySelectorAll('.visitParticipant:checked')).map(cb => cb.value);
    const notes = document.getElementById('visitNotes').value.trim();
    const actionsText = document.getElementById('visitActions').value.trim();
    const actions = actionsText.split('\n').filter(l => l.trim()).map(line => ({
        id: generateId(),
        description: line.trim(),
        status: 'open',
        responsible: APP.currentUser.id
    }));

    const photoInput = document.getElementById('visitPhotos');
    let photos = [];
    if (photoInput && photoInput.files.length > 0) {
        for(let i=0; i<photoInput.files.length; i++) {
            photos.push({
                id: generateId(),
                filename: photoInput.files[i].name,
                url: '#', // Placeholder
                uploadedAt: todayStr()
            });
        }
    }

    const visitStatus = isFullMode() ? (document.getElementById('visitType')?.value || 'completed') : 'completed';
    addVisitToProject(projectId, {
        date: document.getElementById('visitDate').value || todayStr(),
        participants: participants,
        notes: notes,
        actions: actions,
        photos: photos,
        status: visitStatus
    });
    closeModal();
    showToast('Visita registada');
    handleRoute();
}

function removePhoto(projectId, visitId, photoId) {
    if (confirm('Tem a certeza que deseja remover esta fotografia?')) {
        if (removeVisitPhoto(projectId, visitId, photoId)) {
            showToast('Fotografia removida');
            handleRoute();
        }
    }
}

function openAddPhotosToVisitModal(projectId, visitId) {
    const body = `
        <div class="form-group">
            <label class="form-label">Adicionar Fotografias</label>
            <input type="file" class="form-input" id="extraVisitPhotos" multiple accept="image/*" style="padding:8px;">
            <p style="font-size:10px; color:#9ca3af; margin-top:4px;">Seleccione mais fotos para anexar a esta visita.</p>
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="uploadMorePhotosToVisit('${projectId}','${visitId}')">Carregar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Anexar Fotografias', body, footer);
}

function uploadMorePhotosToVisit(projectId, visitId) {
    const photoInput = document.getElementById('extraVisitPhotos');
    if (!photoInput || photoInput.files.length === 0) {
        showToast('Seleccione pelo menos uma fotografia');
        return;
    }

    let newPhotos = [];
    for(let i=0; i<photoInput.files.length; i++) {
        newPhotos.push({
            id: generateId(),
            filename: photoInput.files[i].name,
            url: '#',
            uploadedAt: todayStr()
        });
    }

    if (addPhotosToVisit(projectId, visitId, newPhotos)) {
        closeModal();
        showToast('Fotografias adicionadas');
        handleRoute();
    }
}

function printSiteVisitReport(projectId, visitId) {
    const proj = getProject(projectId);
    const visit = (proj?.visits || []).find(v => v.id === visitId);
    if (!proj || !visit) return;

    const participants = (visit.participants || []).map(id => esc(getPersonName(id))).join(', ');
    const actions = (visit.actions || []).map(a =>
        `<tr><td style="padding:6px 12px; border:1px solid #eee;">${esc(a.description)}</td>
         <td style="padding:6px 12px; border:1px solid #eee;">${esc(getPersonName(a.responsible))}</td>
         <td style="padding:6px 12px; border:1px solid #eee;">${a.status === 'done' ? '✓' : '—'}</td></tr>`
    ).join('');
    const photos = (visit.photos || []).map(() =>
        `<div style="width:200px; height:140px; border:1px solid #eee; display:inline-flex; align-items:center; justify-content:center; margin:4px; color:#9ca3af; font-size:12px;">Foto</div>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
        body { font-family: Inter, sans-serif; padding: 40px; color: #111827; }
        h1 { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; }
        @media print { button { display: none; } }
    </style>
    </head><body>
    <h1>${esc(proj.name)}</h1>
    <p style="color:#6b7280; margin:0 0 32px;">${esc(APP.office.name)}</p>
    <h2 style="font-size:16px; border-bottom:2px solid #111827; padding-bottom:8px;">Relatório de Visita — ${visit.date}</h2>
    <p><strong>Participantes:</strong> ${participants || '—'}</p>
    <p><strong>Observações:</strong></p>
    <p style="background:#f9fafb; padding:16px; border-left:3px solid #e5e7eb;">${esc(visit.notes || visit.summary || '—')}</p>
    ${actions ? `<h3 style="margin-top:24px;">Acções</h3>
    <table><thead><tr>
        <th style="padding:8px 12px; text-align:left; background:#f9fafb; border:1px solid #eee;">Acção</th>
        <th style="padding:8px 12px; text-align:left; background:#f9fafb; border:1px solid #eee;">Responsável</th>
        <th style="padding:8px 12px; text-align:left; background:#f9fafb; border:1px solid #eee;">Estado</th>
    </tr></thead><tbody>${actions}</tbody></table>` : ''}
    ${photos ? `<h3 style="margin-top:24px;">Fotografias</h3><div>${photos}</div>` : ''}
    <script>window.print();<\/script>
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
}
