function renderProjectMessages(proj) {
    let postsHtml = (proj.posts && proj.posts.length > 0) ? proj.posts.map(p => `
        <div class="card" style="padding:20px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:#111827; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">${getInitials(getPersonName(p.user))}</div>
                    <div>
                        <p style="font-size:13px; font-weight:800; margin:0; letter-spacing:-0.2px;">${getPersonName(p.user)}</p>
                        <p style="font-size:11px; color:#9ca3af; margin:0;">${p.date}${p.phaseKey ? ` <span style="background:#f3f4f6; color:#374151; font-size:10px; font-weight:700; padding:1px 6px; border-radius:3px;">[${esc((proj.phases.find(ph=>ph.key===p.phaseKey)||{}).abbr||p.phaseKey)}]</span>` : ''}</p>
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    ${p.internal ? '<span style="font-size:10px; color:#dc2626; background:#fef2f2; padding:2px 8px; border-radius:12px; border:1px solid #fecaca; font-weight:600;">Só Interno</span>' : '<span style="font-size:10px; color:#6b7280; background:#f9fafb; padding:2px 8px; border-radius:12px; border:1px solid #e5e7eb; font-weight:600;">Visível ao Cliente</span>'}
                </div>
            </div>
            <p style="font-size:14px; line-height:1.6; color:#374151; margin:0;">${esc(p.content)}</p>
        </div>
    `).join('') : '<div class="empty-state" style="padding:24px;"><p>Nenhum post publicado no fórum do projecto.</p></div>';

    let auditHtml = `
        <div style="margin-top:60px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <h4 style="font-size:12px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0;">Audit Log Interno (Invisível ao Cliente)</h4>
            </div>
            <div style="max-height:240px; overflow-y:auto; font-size:11px; color:#4b5563; font-family:monospace; background:#f9fafb; padding:16px; border:1px solid #f3f4f6; border-radius:6px;">
                ${proj.history.map(h => `<div style="margin-bottom:4px;"><span style="color:#9ca3af;">[${h.date}]</span> <strong>${getPersonName(h.user)}</strong>: ${esc(h.action)} <span style="color:#9ca3af;">${esc(h.detail || '')}</span></div>`).join('')}
            </div>
        </div>
    `;

    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
            <div>
                <h3 style="font-size:18px; font-weight:800; margin:0; letter-spacing:-0.5px;">Comunicação & Avisos</h3>
                <p style="font-size:12px; color:#6b7280; margin:2px 0 0;">Quadro de comunicações directas entre equipa interna, técnicos externos e clientes.</p>
            </div>
            <button class="btn btn-primary" onclick="openNewPostModal('${proj.id}')">Publicar</button>
        </div>
        ${postsHtml}
        ${auditHtml}
    `;
}

function openNewPostModal(projectId) {
    const body = `
        <div class="form-group">
            <label class="form-label" style="font-weight:700;">Mensagem para a Equipa / Cliente</label>
            <textarea class="form-input" id="newPostText" rows="6" placeholder="Escreva o resumo da semana, um pedido formal ou anotação importante..."></textarea>
        </div>
        <div class="form-group" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="newPostInternal" checked style="width:16px; height:16px;" onchange="document.getElementById('notifyClientGroup').style.display=this.checked?'none':'flex'">
            <label for="newPostInternal" style="font-size:13px; font-weight:600; color:#374151; margin:0; cursor:pointer;">Apenas visível internamente (esconder do cliente)</label>
        </div>
        <div class="form-group" id="notifyClientGroup" style="display:none; align-items:center; gap:8px; margin-top:4px;">
            <input type="checkbox" id="newPostNotifyClient" style="width:16px; height:16px;">
            <label for="newPostNotifyClient" style="font-size:13px; font-weight:600; color:#374151; margin:0; cursor:pointer;">Enviar notificação por email ao cliente</label>
        </div>
        ${isFullMode() ? (() => {
            const proj = getProject(projectId);
            if (!proj) return '';
            return `<div class="form-group" id="phaseContextGroup">
                <label class="form-label">Contexto/Fase (opcional)</label>
                <select class="form-input" id="newPostPhaseKey">
                    <option value="">— Sem contexto específico —</option>
                    ${proj.phases.map(ph => `<option value="${ph.key}">${esc(ph.abbr)} — ${esc(ph.name)}</option>`).join('')}
                </select>
            </div>`;
        })() : ''}
    `;
    const footer = `
        <button class="btn btn-primary" onclick="addPost('${projectId}')">Publicar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Novo Post Público', body, footer);
}

function addPost(projectId) {
    const proj = PROJECTS.find(p => p.id === projectId);
    if (!proj) return;
    if (!proj.posts) proj.posts = [];
    const content = document.getElementById('newPostText').value.trim();
    if (!content) { showToast('Escreva algo para poder publicar'); return; }
    const internal = document.getElementById('newPostInternal').checked;
    const phaseKey = isFullMode() ? (document.getElementById('newPostPhaseKey')?.value || null) : null;
    addPostToProject(projectId, {
        content: content,
        authorId: APP.currentUser.id,
        internal: internal,
        phaseKey: phaseKey || undefined
    });
    const notifyClient = !internal && document.getElementById('newPostNotifyClient')?.checked;
    closeModal();
    showToast(notifyClient ? 'Mensagem publicada. Cliente seria notificado por email.' : 'Mensagem publicada.');
    handleRoute();
}

// ============================================================================
// TAB: EQUIPA DO PROJECTO (NEW)
// ============================================================================

