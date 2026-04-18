function renderProjectPendencias(proj) {
    let open = proj.pendencias.filter(p => p.status === 'open');
    const closed = proj.pendencias.filter(p => p.status === 'closed');

    let html = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:700; margin:0;">${open.length} Pendência${open.length !== 1 ? 's' : ''} em Aberto</h3>
            <button class="btn btn-primary btn-sm" onclick="openNewPendenciaModal('${proj.id}','${proj.currentPhaseKey}')">+ Nova Pendência</button>
        </div>
    `;

    // [BLOCO B.3]
    if (isFullMode()) {
        const allMembers = [...(proj.team?.members||[]), ...(proj.team?.externals||[])];
        html += `<div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
            <select class="form-input" style="max-width:200px;" onchange="UI_STATE.pendFilter.responsible=this.value; renderProject()">
                <option value="">Todos os responsáveis</option>
                ${allMembers.map(id => `<option value="${id}" ${UI_STATE.pendFilter.responsible===id?'selected':''}>${esc(getPersonName(id))}</option>`).join('')}
            </select>
            <select class="form-input" style="max-width:200px;" onchange="UI_STATE.pendFilter.phase=this.value; renderProject()">
                <option value="">Todas as fases</option>
                ${proj.phases.map(ph => `<option value="${ph.key}" ${UI_STATE.pendFilter.phase===ph.key?'selected':''}>${esc(ph.abbr)}</option>`).join('')}
            </select>
        </div>`;
        if (UI_STATE.pendFilter.responsible) open = open.filter(p => p.responsible === UI_STATE.pendFilter.responsible);
        if (UI_STATE.pendFilter.phase) open = open.filter(p => p.phase === UI_STATE.pendFilter.phase);
    }

    if (open.length === 0) {
        html += `<div class="empty-state" style="margin-bottom:24px;"><p>Nenhuma pendência em aberto.</p></div>`;
    } else {
        html += `<div class="card" style="overflow:hidden; margin-bottom:24px;">`;
        open.forEach((pend, i) => {
            const phase = proj.phases.find(ph => ph.key === pend.phase);
            const urgency = getPendenciaUrgencyStyle(pend);
            const bgStyle = urgency.bg ? `background:${urgency.bg};` : '';
            html += `
                <div style="display:flex; align-items:center; gap:12px; padding:12px 18px; ${i < open.length - 1 ? 'border-bottom:1px solid #f0ece7;' : ''} cursor:pointer; transition:background 0.15s; ${bgStyle}"
                     onmouseenter="this.style.background='#f9f8f6'" onmouseleave="this.style.background='${urgency.bg || 'transparent'}'"
                     onclick="openPendenciaModal('${proj.id}','${pend.id}')">
                    <div style="width:8px; height:8px; border-radius:50%; flex-shrink:0; background:${pend.priority === 'high' ? '#dc2626' : pend.priority === 'medium' ? '#d97706' : '#2563eb'};"></div>
                    <div style="flex:1; min-width:0;">
                        <p style="font-size:13px; font-weight:500; margin:0;">${esc(pend.description)}</p>
                        <p style="font-size:11px; color:#9a928a; margin:2px 0 0;">
                            ${phase ? phase.abbr + ' · ' : ''}${getPersonName(pend.responsible)} · ${pend.deadline || 'Sem prazo'}
                            ${urgency.text ? `<span style="color:${urgency.color}; font-size:10px; font-weight:700; margin-left:6px;">${urgency.text}</span>` : ''}
                        </p>
                    </div>
                    <span class="badge ${getPriorityColor(pend.priority)}">${getPriorityLabel(pend.priority)}</span>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (closed.length > 0) {
        html += `
            <h4 style="font-size:13px; font-weight:600; color:#9a928a; margin:0 0 10px;">Concluídas (${closed.length})</h4>
            <div class="card" style="overflow:hidden; opacity:0.6;">
        `;
        closed.forEach((pend, i) => {
            html += `
                <div style="display:flex; align-items:center; gap:10px; padding:8px 18px; ${i < closed.length - 1 ? 'border-bottom:1px solid #f0ece7;' : ''}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style="font-size:12px; text-decoration:line-through; color:#b0a99f;">${esc(pend.description)}</span>
                </div>
            `;
        });
        html += `</div>`;
    }

    return html;
}

// ============================================================================
// renderProjectTeam removida — duplicada por renderProjectTeamTab

// ============================================================================
// TAB 8: HISTÓRICO
// ============================================================================

