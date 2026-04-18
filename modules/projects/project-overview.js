function renderProjectOverview(proj) {
    const totalHours = getTotalHours(proj.id);
    const { billable, nonBillable } = getBillableHours(proj.id);
    const doneDeliverables = proj.phases.reduce((sum, ph) => sum + ph.deliverables.filter(d => d.status === 'approved' || d.status === 'done').length, 0);
    const totalDeliverables = proj.phases.reduce((sum, ph) => sum + ph.deliverables.length, 0);
    const openPendencias = proj.pendencias.filter(p => p.status === 'open').length;

    let html = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:28px; align-items:start;">

            <!-- Phase map -->
            <div>
                <h3 style="font-size:15px; font-weight:700; margin:0 0 18px;">Mapa de Fases</h3>
    `;

    proj.phases.forEach((phase, idx) => {
        const isLast = idx === proj.phases.length - 1;
        const depNames = phase.dependencies.map(dk => {
            const dp = proj.phases.find(p => p.key === dk);
            return dp ? dp.abbr : dk;
        }).join(', ');

        html += `
            <div class="phase-node" onclick="navigate('projecto',{id:'${proj.id}',tab:'fases',phase:'${phase.key}'})">
                <div>
                    <div class="phase-dot ${phase.status}">${phase.abbr}</div>
                    ${!isLast ? `<div class="phase-line ${phase.status === 'done' ? 'done' : ''}"></div>` : ''}
                </div>
                <div style="flex:1; padding-top:2px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:13px; font-weight:600;">${phase.name}</span>
                        <span class="badge ${getStatusColor(phase.status)}" style="font-size:10px;">${getStatusLabel(phase.status)}</span>
                    </div>
                    <div style="font-size:11px; color:#9a928a; margin-top:3px;">
                        ${phase.deliverables.filter(d => d.status === 'approved' || d.status === 'done').length}/${phase.deliverables.length} entregáveis
                        ${phase.startDate ? ` · Início: ${phase.startDate}` : ''}
                        ${phase.endDate ? ` · Previsto: ${phase.endDate}` : ''}
                    </div>
                    ${phase.status === 'blocked' ? `<p style="font-size:11px; color:#dc2626; margin:3px 0 0;">Bloqueado — dependências não concluídas</p>` : ''}
                    ${depNames && phase.status !== 'done' ? `<p style="font-size:10px; color:#b0a99f; margin:2px 0 0;">Depende de: ${depNames}</p>` : ''}
                </div>
            </div>
        `;
    });

    html += `</div>`;

    // Stats & next steps
    html += `
        <div>
            <!-- Stats -->
            <h3 style="font-size:15px; font-weight:700; margin:0 0 14px;">Estatísticas</h3>
            <div class="card" style="padding:20px; margin-bottom:24px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div>
                        <p style="font-size:11px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Horas totais</p>
                        <p style="font-size:20px; font-weight:700; margin:0;">${totalHours.toFixed(1)}h</p>
                        <p style="font-size:11px; color:#7a736b; margin:2px 0 0;">${billable.toFixed(1)}h facturável · ${nonBillable.toFixed(1)}h não fact.</p>
                    </div>
                    <div>
                        <p style="font-size:11px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Entregáveis</p>
                        <p style="font-size:20px; font-weight:700; margin:0;">${doneDeliverables}/${totalDeliverables}</p>
                        <div class="progress-bar" style="margin-top:6px;">
                            <div class="progress-fill" style="width:${totalDeliverables > 0 ? Math.round(doneDeliverables / totalDeliverables * 100) : 0}%; background:#16a34a;"></div>
                        </div>
                    </div>
                    <div>
                        <p style="font-size:11px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Orçamento</p>
                        <p style="font-size:20px; font-weight:700; margin:0;">${proj.budget > 0 ? (proj.budget / 1000).toFixed(0) + 'k €' : '—'}</p>
                    </div>
                    <div>
                        <p style="font-size:11px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Pendências</p>
                        <p style="font-size:20px; font-weight:700; margin:0; ${openPendencias > 0 ? 'color:#d97706' : ''}">${openPendencias}</p>
                    </div>
                    ${(() => {
                        if (!proj.quoteId) return '';
                        const q = QuotesModule._list.find(x => x.id === proj.quoteId);
                        if (!q) return '';
                        const fmt = n => new Intl.NumberFormat('pt-PT', {style:'currency', currency:'EUR'}).format(n);
                        return `
                            <div>
                                <p style="font-size:11px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Contrato</p>
                                <p style="font-size:20px; font-weight:700; margin:0;">${fmt(proj.contractValue || q.fees.summary.total)}</p>
                                <p style="font-size:11px; color:#7a736b; margin:2px 0 0;">
                                    <a href="#" onclick="navigate('orcamentos')" style="color:#2563eb; text-decoration:none;">Ver Proposta ${q.reference}</a>
                                </p>
                            </div>
                        `;
                    })()}
                </div>
            </div>

            <!-- Next steps -->
            <h3 style="font-size:15px; font-weight:700; margin:0 0 14px;">Próximos Passos</h3>
            <div class="card" style="overflow:hidden;">
    `;

    // Collect next action items
    const nextSteps = [];
    proj.phases.forEach(phase => {
        if (phase.status === 'active') {
            phase.deliverables.forEach(del => {
                if (del.status !== 'approved' && del.status !== 'done') {
                    nextSteps.push({ type: 'deliverable', label: del.name, sub: phase.abbr + ' — ' + phase.name, phaseKey: phase.key, delId: del.id });
                }
            });
            phase.approvals.forEach(apr => {
                if (apr.status === 'pending') {
                    nextSteps.push({ type: 'approval', label: apr.name, sub: phase.abbr + ' — ' + getApprovalTypeLabel(apr.type), phaseKey: phase.key });
                }
            });
        }
    });
    proj.pendencias.filter(p => p.status === 'open' && p.priority === 'high').forEach(pend => {
        nextSteps.push({ type: 'pendencia', label: pend.description, sub: 'Pendência · ' + getPriorityLabel(pend.priority), pendId: pend.id });
    });

    if (nextSteps.length === 0) {
        html += `<div class="empty-state" style="padding:24px;"><p>Nenhuma acção pendente.</p></div>`;
    } else {
        nextSteps.slice(0, 6).forEach((step, i) => {
            const onclick = step.type === 'pendencia'
                ? `openPendenciaModal('${proj.id}','${step.pendId}')`
                : `navigate('projecto',{id:'${proj.id}',tab:'fases',phase:'${step.phaseKey}'})`;
            html += `
                <div style="display:flex; align-items:center; gap:12px; padding:10px 18px; ${i < Math.min(nextSteps.length, 6) - 1 ? 'border-bottom:1px solid #f0ece7;' : ''} cursor:pointer; transition:background 0.15s;"
                     onmouseenter="this.style.background='#f9f8f6'" onmouseleave="this.style.background='transparent'"
                     onclick="${onclick}">
                    <div style="width:6px; height:6px; border-radius:50%; background:${step.type === 'pendencia' ? '#d97706' : step.type === 'approval' ? '#7c3aed' : '#2563eb'}; flex-shrink:0;"></div>
                    <div style="flex:1; min-width:0;">
                        <p style="font-size:13px; font-weight:500; margin:0;">${step.label}</p>
                        <p style="font-size:11px; color:#9a928a; margin:1px 0 0;">${step.sub}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0a99f" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            `;
        });
    }

    html += `</div></div></div>`;
    return html;
}

// ============================================================================
// TAB 2: FASES E ENTREGÁVEIS
// ============================================================================

