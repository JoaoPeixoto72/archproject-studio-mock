// ============================================================================
// ArchProject — geral.js
// Vistas Globais: Tarefas, Tempo, Actividade
// ============================================================================

// ── TAREFAS ──

function renderGeralTarefas() {
    const pendencias = getAllPendencias();
    const approvals = getAllPendingApprovals();

    let filteredTasks = pendencias;
    if (UI_STATE.geralTarefas.taskPriorityFilter) {
        filteredTasks = pendencias.filter(p => p.priority === UI_STATE.geralTarefas.taskPriorityFilter);
    }
    if (isFullMode()) {
        if (UI_STATE.geralPendFilter.project) filteredTasks = filteredTasks.filter(p => p.projectId === UI_STATE.geralPendFilter.project);
        if (UI_STATE.geralPendFilter.responsible) filteredTasks = filteredTasks.filter(p => p.responsible === UI_STATE.geralPendFilter.responsible);
    }
    const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1 };
    filteredTasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    let html = `
        <div class="content-container">
            <div class="page-header">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                    <div>
                        <h2>Tarefas & Aprovações</h2>
                        <p>Gestão centralizada de pendências de todos os projectos.</p>
                    </div>
                    <button class="btn btn-primary" onclick="openNewPendenciaModal()">+ Nova Tarefa</button>
                </div>
                <div class="tabs">
                    <button class="tab-btn ${UI_STATE.geralTarefas.tab === 'tarefas' ? 'active' : ''}" onclick="UI_STATE.geralTarefas.tab = 'tarefas'; renderGeralTarefas();">Tarefas <span class="tab-count">${pendencias.length}</span></button>
                    <button class="tab-btn ${UI_STATE.geralTarefas.tab === 'aprovacoes' ? 'active' : ''}" onclick="UI_STATE.geralTarefas.tab = 'aprovacoes'; renderGeralTarefas();">Aprovações <span class="tab-count">${approvals.length}</span></button>
                </div>
            </div>

            <div class="page-body">
                ${UI_STATE.geralTarefas.tab === 'tarefas' ? renderGeralTarefasContent(filteredTasks) : renderGeralApprovalsContent(approvals)}
            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}

function renderGeralTarefasContent(tasks) {
    let html = `
        <div style="margin-bottom:24px; display:flex; gap:12px; flex-wrap:wrap;">
            <select class="form-input" style="max-width:200px;" onchange="UI_STATE.geralTarefas.taskPriorityFilter = this.value; renderGeralTarefas();">
                <option value="">Todas as prioridades</option>
                <option value="high" ${UI_STATE.geralTarefas.taskPriorityFilter === 'high' ? 'selected' : ''}>Alta</option>
                <option value="medium" ${UI_STATE.geralTarefas.taskPriorityFilter === 'medium' ? 'selected' : ''}>Média</option>
                <option value="low" ${UI_STATE.geralTarefas.taskPriorityFilter === 'low' ? 'selected' : ''}>Baixa</option>
            </select>
            ${isFullMode() ? `
                <select class="form-input" style="max-width:200px;" onchange="UI_STATE.geralPendFilter.project=this.value; renderGeralTarefas()">
                    <option value="">Todos os projectos</option>
                    ${PROJECTS.map(p => `<option value="${p.id}" ${UI_STATE.geralPendFilter.project===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}
                </select>
                <select class="form-input" style="max-width:200px;" onchange="UI_STATE.geralPendFilter.responsible=this.value; renderGeralTarefas()">
                    <option value="">Todos os responsáveis</option>
                    ${TEAM.members.map(m => `<option value="${m.id}" ${UI_STATE.geralPendFilter.responsible===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}
                </select>
            ` : ''}
        </div>
    `;
    if (tasks.length === 0) return html + '<div class="card p-4">Nenhuma tarefa encontrada.</div>';
    
    html += '<div class="card">';
    tasks.forEach((pend, i) => {
        const urgency = getPendenciaUrgencyStyle(pend);
        const bgStyle = urgency.bg ? `background:${urgency.bg};` : '';
        html += `
            <div style="display:flex; align-items:center; gap:16px; padding:16px 20px; ${i < tasks.length - 1 ? 'border-bottom:1px solid #f9f9f9;' : ''} cursor:pointer; ${bgStyle}" onclick="openPendenciaModal('${pend.projectId}','${pend.id}')">
                <div style="width:4px; height:24px; background:${pend.priority === 'high' ? '#ef4444' : pend.priority === 'medium' ? '#f59e0b' : '#3b82f6'};"></div>
                <div style="flex:1;">
                    <p style="font-size:14px; font-weight:700; margin:0;">${esc(pend.description)}</p>
                    <p style="font-size:11px; color:var(--text-muted); margin:4px 0 0;">
                        <span style="font-weight:600; color:var(--text-main);">${pend.projectName}</span> · ${getPersonName(pend.responsible)}
                    </p>
                    <div style="display:flex; gap:12px; margin-top:6px;">
                        <p style="font-size:10px; color:#9ca3af; margin:0;">Início: <span style="font-weight:600; color:var(--text-muted);">${pend.createdAt || '—'}</span></p>
                        <p style="font-size:10px; color:#9ca3af; margin:0;">Previsto terminar: <span style="font-weight:600; color:#ef4444;">${pend.deadline || '—'}</span>
                            ${urgency.text ? `<span style="color:${urgency.color}; font-size:10px; font-weight:700; margin-left:6px;">${urgency.text}</span>` : ''}
                        </p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <span class="badge ${getPriorityColor(pend.priority)}" style="font-size:9px; text-transform:uppercase; letter-spacing:0.5px;">${getPriorityLabel(pend.priority)}</span>
                </div>
            </div>
        `;
    });
    return html + '</div>';
}

function renderGeralApprovalsContent(approvals) {
    if (approvals.length === 0) return '<div class="card p-4">Nenhuma aprovação pendente.</div>';
    let html = '<div class="card">';
    approvals.forEach((apr, i) => {
        html += `
            <div style="display:flex; align-items:center; gap:16px; padding:16px 20px; ${i < approvals.length - 1 ? 'border-bottom:1px solid #f9f9f9;' : ''} cursor:pointer;" onclick="navigate('projecto',{id:'${apr.projectId}',tab:'fases'})">
                <div style="width:32px; height:32px; border-radius:50%; background:var(--bg-muted); display:flex; align-items:center; justify-content:center; color:#8b5cf6;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style="flex:1;">
                    <p style="font-size:14px; font-weight:700; margin:0;">${apr.name}</p>
                    <p style="font-size:11px; color:var(--text-muted); margin:2px 0 0;">
                        <span style="font-weight:700; color:var(--text-main);">${apr.projectName}</span> · Fase: ${apr.phaseName}
                    </p>
                    <p style="font-size:10px; color:#9ca3af; margin:4px 0 0;">Pedido em: <span style="font-weight:600; color:var(--text-muted);">${apr.submittedAt || '—'}</span></p>
                </div>
                <div style="text-align:right;">
                    <span class="badge ${getStatusColor(apr.status)}" style="font-size:9px; text-transform:uppercase;">Aguarda Revisão</span>
                </div>
            </div>
        `;
    });
    return html + '</div>';
}

// ── TEMPO ──
function renderGeralTempo() {
    const allLogs = getAllTimeLogs();
    const totalHours = allLogs.reduce((sum, log) => sum + log.hours, 0);
    const weeklyHours = getWeeklyHours();
    const monthlyHours = totalHours; // Simplified for mock
    
    const billableHours = allLogs.filter(l => l.billable).reduce((sum, l) => sum + l.hours, 0);
    const billablePercent = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

    // Horas orçamentadas totais (orçamentos aceites com projectId)
    const quotedHours = (typeof QuotesModule !== 'undefined' ? QuotesModule._list || [] : [])
        .filter(q => q.status === 'accepted' && q.projectId)
        .reduce((sum, q) => sum + (q.scope?.phases || []).reduce((s, p) => s + (p.estimatedHours || 0), 0), 0);

    // Semana anterior
    const prevWeekHours = getPreviousWeekHours();
    const weekDiff = prevWeekHours > 0
        ? `${weeklyHours >= prevWeekHours ? '+' : ''}${Math.round(((weeklyHours - prevWeekHours) / prevWeekHours) * 100)}% vs semana anterior`
        : 'Sem dados anteriores';

    // Percentagem utilizada
    const usedPct = quotedHours > 0 ? Math.round((totalHours / quotedHours) * 100) : null;
    const usedStr = usedPct !== null ? `${usedPct}% utilizado` : '— sem orçamentos';
    const budgetVsReal = quotedHours > 0 ? `${totalHours.toFixed(0)}h / ${quotedHours.toFixed(0)}h` : `${totalHours.toFixed(0)}h registadas`;

    // Custo estimado
    const rate = SETTINGS.rates?.defaultHourlyRate || 75;
    const estimatedCost = totalHours * rate;

    let html = `
        <div class="content-container">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; padding-bottom:40px;">
                <div>
                    <h2 style="font-size:32px; font-weight:800; letter-spacing:-1.2px;">Tempo</h2>
                    <p style="font-size:14px; color:var(--text-muted); font-weight:500;">Registo rápido e leitura por projeto, fase e faturamento</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary" style="height:40px; font-size:12px; font-weight:700; border: 1px solid #e2ddd7; background:#fff;" onclick="openManualTimeGeralModal()">Registo manual</button>
                    <button class="btn btn-secondary" style="height:40px; font-size:12px; font-weight:700; border: 1px solid #e2ddd7; background:#fff;" onclick="showToast('Relatório exportado com sucesso (mock)')">Exportar relatório</button>
                </div>
            </div>

            <div class="page-body">
                <!-- Quick Timer Bar -->
                <div class="card" style="padding:20px; border-radius:0; border: 1px solid #eee; margin-bottom:32px; display:flex; align-items:center; gap:20px; background:#fff;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:10px; color:#9ca3af; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">PROJ:</span>
                            <select class="form-input" id="quickProjSelect" style="border:none; background:var(--bg-main); font-weight:700; font-size:13px; padding:8px 12px; width:160px;" onchange="updateQuickPhaseOptions(this.value)">
                                <option value="">Seleccionar...</option>
                                ${PROJECTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:10px; color:#9ca3af; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">FASE:</span>
                            <select class="form-input" id="quickPhaseSelect" style="border:none; background:var(--bg-main); font-weight:700; font-size:13px; padding:8px 12px; width:140px;">
                                <option value="">—</option>
                            </select>
                        </div>
                        <input type="text" id="quickDescInput" class="form-input" placeholder="O que está a fazer agora?" style="flex:1; border: 1px solid var(--bg-muted); background:#fff; font-size:13px; padding:10px 16px; min-width:200px;">
                    </div>
                    <div style="display:flex; align-items:center; gap:12px; padding-left:20px; border-left:1px solid var(--bg-muted);">
                        <button class="btn btn-primary" style="height:44px; padding:0 24px; border-radius:0; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;" onclick="startQuickTimer()">Iniciar</button>
                    </div>
                </div>

                ${isFullMode() ? `
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:40px;">
                    <div class="card" style="padding:24px; display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <p style="font-size:11px; color:#9ca3af; font-weight:700; text-transform:uppercase;">Esta semana</p>
                            <h3 style="font-size:26px; font-weight:800; margin:10px 0 4px;">${formatDurationHours(weeklyHours)}</h3>
                            <p style="font-size:11px; color:#10b981; font-weight:600;">${weekDiff}</p>
                        </div>
                        <div style="width:44px; height:44px; border-radius:50%; background:#f0f9ff; color:#0ea5e9; display:flex; align-items:center; justify-content:center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                    </div>
                    <div class="card" style="padding:24px; display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <p style="font-size:11px; color:#9ca3af; font-weight:700; text-transform:uppercase;">Este mês</p>
                            <h3 style="font-size:26px; font-weight:800; margin:10px 0 4px;">${formatDurationHours(monthlyHours)}</h3>
                            <p style="font-size:11px; color:var(--text-muted); font-weight:600;">equipa total</p>
                        </div>
                        <div style="width:44px; height:44px; border-radius:50%; background:#f5f3ff; color:#8b5cf6; display:flex; align-items:center; justify-content:center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                    </div>
                    <div class="card" style="padding:24px; display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <p style="font-size:11px; color:#9ca3af; font-weight:700; text-transform:uppercase;">Orçado vs Real</p>
                            <h3 style="font-size:26px; font-weight:800; margin:10px 0 4px;">${budgetVsReal}</h3>
                            <p style="font-size:11px; color:#f59e0b; font-weight:600;">${usedStr}</p>
                        </div>
                        <div style="width:44px; height:44px; border-radius:50%; background:#fffbeb; color:#f59e0b; display:flex; align-items:center; justify-content:center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6l9 6 9-6"/><path d="M12 12v9"/><path d="M7 12l5 5 5-5"/></svg>
                        </div>
                    </div>
                    <div class="card" style="padding:24px; display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <p style="font-size:11px; color:#9ca3af; font-weight:700; text-transform:uppercase;">Faturável</p>
                            <h3 style="font-size:26px; font-weight:800; margin:10px 0 4px;">${billablePercent}%</h3>
                            <p style="font-size:11px; color:var(--text-muted); font-weight:600;">${100 - billablePercent}% administrativo interno</p>
                        </div>
                        <div style="width:44px; height:44px; border-radius:50%; background:#f0fdf4; color:#10b981; display:flex; align-items:center; justify-content:center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8"/><path d="M12 16H8v-4"/></svg>
                        </div>
                    </div>
                </div>
                ` : `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:40px;">
                    <div class="card" style="padding:24px; display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <p style="font-size:11px; color:#9ca3af; font-weight:700; text-transform:uppercase;">Esta semana</p>
                            <h3 style="font-size:26px; font-weight:800; margin:10px 0 4px;">${formatDurationHours(weeklyHours)}</h3>
                            <p style="font-size:11px; color:#10b981; font-weight:600;">${weekDiff}</p>
                        </div>
                        <div style="width:44px; height:44px; border-radius:50%; background:#f0f9ff; color:#0ea5e9; display:flex; align-items:center; justify-content:center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                    </div>
                </div>
                `}

                <!-- Additional Summary Boxes -->
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:32px; margin-bottom:40px;">
                    <div class="card" style="padding:24px;">
                        <h3 style="font-size:18px; font-weight:800; margin:0 0 20px;">Resumo</h3>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--bg-main);">
                                <span style="font-size:13px; color:#9ca3af; font-weight:500;">Total de Horas</span>
                                <span style="font-size:14px; font-weight:800; color:var(--text-main);">${totalHours.toFixed(1)}h</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:13px; color:#9ca3af; font-weight:500;">Nº Registos</span>
                                <span style="font-size:14px; font-weight:800; color:var(--text-main);">${allLogs.length}</span>
                            </div>
                            ${isFullMode() ? `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid var(--bg-main);">
                                <span style="font-size:13px; color:#9ca3af; font-weight:500;">Custo Estimado</span>
                                <span style="font-size:14px; font-weight:800; color:var(--text-main);">${formatCurrency(estimatedCost)}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Por Projecto -->
                    <div class="card" style="padding:24px;">
                        <h3 style="font-size:18px; font-weight:800; margin:0 0 20px;">Por Projecto</h3>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            ${PROJECTS.map(p => {
                                const pHours = (p.timeLogs || []).reduce((sum, tl) => sum + tl.hours, 0);
                                if (pHours === 0) return '';
                                return `
                                    <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--bg-main);">
                                        <span style="font-size:13px; color:var(--text-main); font-weight:600;">${p.name}</span>
                                        <span style="font-size:14px; font-weight:800; color:var(--text-main);">${pHours.toFixed(1)}h</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                ${isFullMode() ? (() => {
                    const memberMap = {};
                    getAllTimeLogs().forEach(tl => {
                        if (!memberMap[tl.user]) memberMap[tl.user] = { week: 0, month: 0, total: 0, billable: 0 };
                        memberMap[tl.user].total += tl.hours;
                        if (tl.billable) memberMap[tl.user].billable += tl.hours;
                    });
                    TEAM.members.forEach(m => {
                        if (!memberMap[m.id]) memberMap[m.id] = { week: 0, month: 0, total: 0, billable: 0 };
                        memberMap[m.id].week = getMemberWeeklyHours(m.id);
                        memberMap[m.id].month = getMemberMonthlyHours(m.id);
                    });
                    const rows = TEAM.members.map(m => {
                        const h = memberMap[m.id] || { week: 0, month: 0, total: 0, billable: 0 };
                        const util = h.total > 0 ? (h.billable / h.total * 100).toFixed(1) : '0.0';
                        return `<tr style="border-bottom:1px solid var(--bg-main);">
                            <td style="padding:10px 16px; font-size:13px; font-weight:600;">${esc(m.name)}</td>
                            <td style="padding:10px 16px; text-align:right; font-size:13px;">${h.week.toFixed(1)}h</td>
                            <td style="padding:10px 16px; text-align:right; font-size:13px;">${h.month.toFixed(1)}h</td>
                            <td style="padding:10px 16px; text-align:right; font-size:13px; font-weight:700;">${h.total.toFixed(1)}h</td>
                            <td style="padding:10px 16px; text-align:right; font-size:13px; color:#16a34a; font-weight:700;">${util}%</td>
                        </tr>`;
                    }).join('');
                    return `<div class="card" style="padding:0; overflow:hidden; margin-bottom:40px;">
                        <div style="padding:12px 16px; background:var(--bg-main); border-bottom:1px solid #eee; font-size:11px; font-weight:800; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px;">Horas por Membro</div>
                        <table style="width:100%; border-collapse:collapse; font-size:12px;">
                            <thead><tr style="background:#fafafa; border-bottom:1px solid #eee;">
                                <th style="padding:8px 16px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Membro</th>
                                <th style="padding:8px 16px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Semana</th>
                                <th style="padding:8px 16px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Mês</th>
                                <th style="padding:8px 16px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Total</th>
                                <th style="padding:8px 16px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">% Util.</th>
                            </tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>`;
                })() : ''}

                <!-- Logs Table -->
                <div>
                    <div style="margin-bottom:20px;">
                        <h3 style="font-size:18px; font-weight:800; margin:0;">Registos recentes</h3>
                        <p style="font-size:12px; color:#9ca3af; margin:4px 0 0; font-weight:500;">Tempo sempre ligado à fase</p>
                    </div>
                    
                    <div class="card" style="padding:0; overflow:hidden; border-radius:0;">
                        <table style="width:100%; border-collapse: collapse; font-size:13px;">
                            <thead style="background:var(--bg-main); border-bottom:1px solid var(--bg-muted);">
                                <tr>
                                    <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer;">Explicação / Trabalho</th>
                                    <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer;">Projecto / Fase</th>
                                    <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; width:120px;">Data</th>
                                    <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer;">Responsável</th>
                                    <th style="padding:16px 24px; text-align:right; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer;">Horas</th>
                                    <th style="padding:16px 24px; text-align:right; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; width:100px;">Faturação</th>
                                </tr>
                            </thead>
                            <tbody style="background:#fff;">
                                ${allLogs.slice(0, 30).map((log, i) => {
                                    const proj = getProject(log.projectId);
                                    const phase = proj ? proj.phases.find(ph => ph.key === log.phase) : null;
                                    return `
                                        <tr style="${i < 29 ? 'border-bottom: 1px solid var(--bg-main);' : ''}">
                                            <td style="padding:20px 24px; font-weight:700; color:var(--text-main); width:28%;">${esc(log.description)}</td>
                                            <td style="padding:20px 24px; color:var(--text-main); font-weight:600;">
                                                <div style="font-size:13px;">${log.projectName}</div>
                                                <div style="font-size:11px; color:#9ca3af; font-weight:500; margin-top:2px;">${phase ? phase.name : '—'}</div>
                                            </td>
                                            <td style="padding:20px 24px; color:var(--text-muted); font-weight:500; white-space:nowrap;">${log.date}</td>
                                            <td style="padding:20px 24px; color:var(--text-muted); font-weight:500;">${getPersonName(log.user)}</td>
                                            <td style="padding:20px 24px; font-weight:800; color:var(--text-main); text-align:right;">${formatDurationHours(log.hours)}</td>
                                            <td style="padding:20px 24px; text-align:right;">
                                                <span style="font-size:10px; font-weight:800; text-transform:uppercase; color:${log.billable ? '#16a34a' : '#9ca3af'}; letter-spacing:0.5px;">
                                                    ${log.billable ? 'Facturável' : 'Interno'}
                                                </span>
                                            </td>
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

function updateQuickPhaseOptions(projectId) {
    const select = document.getElementById('quickPhaseSelect');
    if (!select) return;
    if (!projectId) {
        select.innerHTML = '<option value="">—</option>';
        return;
    }
    const proj = getProject(projectId);
    if (!proj) return;
    select.innerHTML = proj.phases.map(ph => `<option value="${ph.key}">${ph.abbr} — ${ph.name}</option>`).join('');
}

function openManualTimeGeralModal() {
    const body = `
        <div class="form-group">
            <label class="form-label">Projecto</label>
            <select class="form-input" id="manualTimeProj" onchange="updateManualTimePhaseOptions(this.value)">
                <option value="">Seleccionar Projecto</option>
                ${PROJECTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Fase</label>
            <select class="form-input" id="manualTimePhase">
                <option value="">Seleccione um projecto primeiro</option>
            </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div class="form-group">
                <label class="form-label">Data</label>
                <input type="date" class="form-input" id="manualTimeDate" value="${todayStr()}">
            </div>
            <div class="form-group">
                <label class="form-label">Horas</label>
                <input type="number" step="0.5" class="form-input" id="manualTimeHours" placeholder="Ex: 2.5">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <input type="text" class="form-input" id="manualTimeDesc" placeholder="O que fez...">
        </div>
        <div class="form-group" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="manualTimeBillable" checked style="width:16px; height:16px;">
            <label for="manualTimeBillable" style="font-size:13px; font-weight:600; color:#1a1714; margin:0; cursor:pointer;">Facturável</label>
        </div>
    `;

    const footer = `
        <div style="display:flex; width:100%; align-items:center; gap:12px; justify-content:flex-end;">
            <button class="btn btn-primary" style="padding:10px 32px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; font-size:12px;" onclick="saveManualTimeGeral()">Registar</button>
            <button class="btn btn-secondary" style="padding:10px 24px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; font-size:12px;" onclick="closeModal()">Cancelar</button>
        </div>
    `;

    openModal('Registar Tempo Manual', body, footer);
}

function updateManualTimePhaseOptions(projectId) {
    const select = document.getElementById('manualTimePhase');
    if (!select) return;
    if (!projectId) {
        select.innerHTML = '<option value="">Seleccione um projecto primeiro</option>';
        return;
    }
    const proj = getProject(projectId);
    if (!proj) return;
    select.innerHTML = proj.phases.map(ph => `<option value="${ph.key}">${ph.abbr} — ${ph.name}</option>`).join('');
}

function saveManualTimeGeral() {
    const pId = document.getElementById('manualTimeProj').value;
    const phaseKey = document.getElementById('manualTimePhase').value;
    const hours = parseFloat(document.getElementById('manualTimeHours').value);
    const desc = document.getElementById('manualTimeDesc').value.trim();
    const date = document.getElementById('manualTimeDate').value;
    const billable = document.getElementById('manualTimeBillable').checked;

    if (!pId || !phaseKey || !hours || !desc) {
        showToast('Preencha todos os campos obrigatórios');
        return;
    }
    addTimeLog(pId, {
        date: date,
        hours: hours,
        phase: phaseKey,
        description: desc,
        billable: billable
    });
    closeModal();
    showToast('Tempo registado com sucesso');
    renderGeralTempo();
}

// ── ACTIVIDADE ──

function renderGeralActividade() {
    let history = getAllHistory();
    const today = todayStr();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (isFullMode()) {
        if (UI_STATE.actividade.project) history = history.filter(h => h.projectId === UI_STATE.actividade.project);
        if (UI_STATE.actividade.user) history = history.filter(h => h.user === UI_STATE.actividade.user);
    }

    const actionIcons = {
        'Criou projecto': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
        'Registou tempo': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        'Carregou documento': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
        'Concluiu fase': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    };
    const defaultIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>`;

    let bodyHtml = '';
    if (isFullMode()) {
        // Group by date
        const groups = {};
        history.slice(0, 100).forEach(h => {
            if (!groups[h.date]) groups[h.date] = [];
            groups[h.date].push(h);
        });
        Object.keys(groups).sort((a,b) => b.localeCompare(a)).forEach(date => {
            const label = date === today ? 'Hoje' : date === yesterdayStr ? 'Ontem' : date;
            bodyHtml += `<div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#9ca3af; letter-spacing:1px; padding:12px 24px 6px; background:var(--bg-main); border-bottom:1px solid var(--bg-muted);">${label}</div>`;
            groups[date].forEach((h, i) => {
                const icon = Object.keys(actionIcons).find(k => h.action.includes(k));
                bodyHtml += `<div style="display:flex; align-items:flex-start; gap:16px; padding:12px 24px; border-bottom:1px solid var(--bg-main);">
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--bg-muted); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--text-muted);">${icon ? actionIcons[icon] : defaultIcon}</div>
                    <div style="flex:1;">
                        <p style="font-size:13px; margin:0;"><strong>${esc(getPersonName(h.user))}</strong> ${esc(h.action)}</p>
                        <p style="font-size:11px; color:#9ca3af; margin:2px 0 0;">${esc(h.projectName)} · ${esc(h.detail || '')}</p>
                    </div>
                </div>`;
            });
        });
    } else {
        history.slice(0, 50).forEach((h, i) => {
            bodyHtml += `<div style="display:flex; align-items:flex-start; gap:24px; padding:16px 24px; ${i < history.length - 1 ? 'border-bottom:1px solid #f9f9f9;' : ''}">
                <span style="width:80px; flex-shrink:0; font-size:11px; color:#9ca3af; font-weight:700; padding-top:2px;">${h.date}</span>
                <div style="flex:1;">
                    <p style="font-size:13px; margin:0;"><strong>${esc(getPersonName(h.user))}</strong> ${esc(h.action)}</p>
                    <p style="font-size:11px; color:#9ca3af; margin:2px 0 0;">${esc(h.projectName)} · ${esc(h.detail || '')}</p>
                </div>
            </div>`;
        });
    }

    const filtersHtml = isFullMode() ? `
        <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
            <select class="form-input" style="max-width:200px;" onchange="UI_STATE.actividade.project=this.value; renderGeralActividade()">
                <option value="">Todos os projectos</option>
                ${PROJECTS.map(p => `<option value="${p.id}" ${UI_STATE.actividade.project===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}
            </select>
            <select class="form-input" style="max-width:200px;" onchange="UI_STATE.actividade.user=this.value; renderGeralActividade()">
                <option value="">Todos os utilizadores</option>
                ${TEAM.members.map(m => `<option value="${m.id}" ${UI_STATE.actividade.user===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}
            </select>
        </div>
    ` : '';

    let html = `
        <div class="content-container">
            <div class="page-header">
                <h2>Actividade do Atelier</h2>
                <p>Histórico completo de acções e alterações.</p>
            </div>
            <div class="page-body">
                ${filtersHtml}
                <div class="card" style="padding:0; overflow:hidden;">
                    ${bodyHtml || '<div style="padding:32px; text-align:center; color:#9ca3af;">Sem actividade recente.</div>'}
                </div>
            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}

function startQuickTimer() {
    const projectId = document.getElementById('quickProjSelect')?.value;
    const phaseKey = document.getElementById('quickPhaseSelect')?.value;
    const desc = document.getElementById('quickDescInput')?.value?.trim() || '';
    if (!projectId || !phaseKey) {
        showToast('Seleccione projecto e fase');
        return;
    }
    startTimer(projectId, phaseKey, desc);
}

