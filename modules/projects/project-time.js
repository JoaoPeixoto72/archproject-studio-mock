function renderProjectTime(proj) {
    const totalHours = getTotalHours(proj.id);
    const { billable, nonBillable } = getBillableHours(proj.id);
    const totalBudget = getTotalBudgetHours(proj.id);
    const budgetVariance = totalBudget > 0 ? ((totalHours - totalBudget) / totalBudget * 100) : 0;

    let html = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:700; margin:0;">Tempo</h3>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="openManualTimeModal('${proj.id}','${proj.currentPhaseKey}')">+ Registar Manual</button>
                <button class="btn btn-secondary btn-sm" onclick="openBudgetModal('${proj.id}')">Orçamento</button>
            </div>
        </div>

        <!-- Stats -->
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px;">
            <div class="card" style="padding:16px; text-align:center;">
                <p style="font-size:10px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Total</p>
                <p style="font-size:22px; font-weight:700; margin:0;">${totalHours.toFixed(1)}h</p>
            </div>
            <div class="card" style="padding:16px; text-align:center;">
                <p style="font-size:10px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Orçamento</p>
                <p style="font-size:22px; font-weight:700; margin:0; color:#2563eb;">${totalBudget.toFixed(1)}h</p>
            </div>
            <div class="card" style="padding:16px; text-align:center;">
                <p style="font-size:10px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Desvio</p>
                <p style="font-size:22px; font-weight:700; margin:0; color:${budgetVariance > 10 ? '#dc2626' : budgetVariance < -10 ? '#16a34a' : '#d97706'};">${budgetVariance > 0 ? '+' : ''}${budgetVariance.toFixed(1)}%</p>
            </div>
            <div class="card" style="padding:16px; text-align:center;">
                <p style="font-size:10px; color:#9a928a; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.5px;">Facturável</p>
                <p style="font-size:22px; font-weight:700; margin:0; color:#16a34a;">${billable.toFixed(1)}h</p>
            </div>
        </div>

        <!-- Hours per phase -->
        <h4 style="font-size:13px; font-weight:700; margin:0 0 12px; color:#7a736b; text-transform:uppercase; letter-spacing:0.5px;">Por Fase</h4>
        <div class="card" style="overflow:hidden; margin-bottom:24px;">
    `;

    proj.phases.forEach((phase, i) => {
        const phHours = getPhaseHours(proj.id, phase.key);
        const phaseBudget = phase.budgetHours || 0;
        const phaseVariance = phaseBudget > 0 ? ((phHours - phaseBudget) / phaseBudget * 100) : 0;
        const showBudget = phaseBudget > 0 || phHours > 0;
        
        if (!showBudget) return;
        
        html += `
            <div style="display:flex; align-items:center; gap:12px; padding:10px 18px; ${i < proj.phases.length - 1 ? 'border-bottom:1px solid #f0ece7;' : ''}">
                <span class="badge bg-blue-50 text-blue-700" style="font-size:10px; width:30px; text-align:center;">${phase.abbr}</span>
                <span style="font-size:12px; flex:1;">${phase.name}</span>
                <div style="display:flex; align-items:center; gap:8px; font-size:11px;">
                    <span style="color:#9a928a;">Orç: ${phaseBudget.toFixed(1)}h</span>
                    <span style="color:#5a534b;">Real: ${phHours.toFixed(1)}h</span>
                    ${phaseBudget > 0 ? `<span style="color:${phaseVariance > 10 ? '#dc2626' : phaseVariance < -10 ? '#16a34a' : '#d97706'}; font-weight:700;">${phaseVariance > 0 ? '+' : ''}${phaseVariance.toFixed(0)}%</span>` : ''}
                </div>
            </div>
        `;
    });

    html += `</div>`;

    // Recent logs
    html += `
        <h4 style="font-size:13px; font-weight:700; margin:0 0 12px; color:#7a736b; text-transform:uppercase; letter-spacing:0.5px;">Registos</h4>
        <div class="card" style="overflow:hidden;">
    `;

    if (proj.timeLogs.length === 0) {
        html += `<div class="empty-state" style="padding:24px;"><p>Nenhum registo de tempo.</p></div>`;
    } else {
        proj.timeLogs.slice(0, 20).forEach((tl, i) => {
            const phase = proj.phases.find(ph => ph.key === tl.phase);
            html += `
                <div style="display:flex; align-items:center; gap:12px; padding:8px 18px; ${i < Math.min(proj.timeLogs.length, 20) - 1 ? 'border-bottom:1px solid #f0ece7;' : ''} font-size:12px;">
                    <span style="color:#9a928a; width:75px; flex-shrink:0;">${tl.date}</span>
                    <span class="badge bg-blue-50 text-blue-700" style="font-size:10px;">${phase ? phase.abbr : '—'}</span>
                    <span style="flex:1; color:#5a534b;">${esc(tl.description)}</span>
                    <span style="color:#9a928a;">${getPersonName(tl.user)}</span>
                    <span style="font-weight:700; width:45px; text-align:right;">${tl.hours.toFixed(1)}h</span>
                    <span style="width:14px; text-align:center; color:${tl.billable ? '#16a34a' : '#b0a99f'};" title="${tl.billable ? 'Facturável' : 'Não facturável'}">${tl.billable ? '€' : '—'}</span>
                </div>
            `;
        });
    }

    html += `</div>`;

    // [BLOCO B.3]
    if (isFullMode()) {
        const memberHours = {};
        (proj.timeLogs || []).forEach(tl => {
            if (!memberHours[tl.user]) memberHours[tl.user] = { total: 0, billable: 0 };
            memberHours[tl.user].total += tl.hours;
            if (tl.billable) memberHours[tl.user].billable += tl.hours;
        });
        const rows = Object.entries(memberHours).map(([uid, h]) => {
            const pct = h.total > 0 ? (h.billable / h.total * 100).toFixed(1) : '0.0';
            return `<tr style="border-bottom:1px solid #f9fafb;">
            <td style="padding:10px 16px; font-size:13px; font-weight:600;">${esc(getPersonName(uid))}</td>
            <td style="padding:10px 16px; text-align:right; font-size:13px; font-weight:700;">${h.total.toFixed(1)}h</td>
            <td style="padding:10px 16px; text-align:right; font-size:13px; color:#16a34a; font-weight:700;">${h.billable.toFixed(1)}h</td>
            <td style="padding:10px 16px; text-align:right; font-size:13px; font-weight:700;">${pct}%</td>
        </tr>`;
        }).join('');

        html += `<div class="card" style="padding:0; overflow:hidden; margin-top:20px;">
        <div style="padding:12px 16px; background:#f9fafb; border-bottom:1px solid #eee; font-size:11px; font-weight:800; text-transform:uppercase; color:#6b7280; letter-spacing:0.5px;">Horas por Membro</div>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead><tr style="background:#fafafa; border-bottom:1px solid #eee;">
                <th style="padding:8px 16px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Membro</th>
                <th style="padding:8px 16px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Total</th>
                <th style="padding:8px 16px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Facturável</th>
                <th style="padding:8px 16px; text-align:right; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">% Util.</th>
            </tr></thead>
            <tbody>${rows || '<tr><td colspan="4" style="padding:16px; text-align:center; color:#9ca3af;">Sem registos</td></tr>'}</tbody>
        </table>
    </div>`;
    }

    return html;
}

function openStartTimerModal(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;

    let phaseOptions = proj.phases.filter(ph => ph.status === 'active' || ph.status === 'pending').map(ph =>
        `<option value="${ph.key}" ${ph.key === proj.currentPhaseKey ? 'selected' : ''}>${ph.abbr} — ${ph.name}</option>`
    ).join('');

    const body = `
        <div class="form-group">
            <label class="form-label">Fase</label>
            <select class="form-input" id="timerPhaseSelect">${phaseOptions}</select>
        </div>
        <div class="form-group">
            <label class="form-label">Descrição (opcional)</label>
            <input type="text" class="form-input" id="timerDescInput" placeholder="O que vai fazer...">
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="confirmStartTimer('${projectId}')">Iniciar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;
    openModal('Iniciar Cronómetro', body, footer);
}

function confirmStartTimer(projectId) {
    const phaseKey = document.getElementById('timerPhaseSelect').value;
    const desc = document.getElementById('timerDescInput').value.trim();
    closeModal();
    startTimer(projectId, phaseKey, desc);
}

// ============================================================================
// ORÇAMENTO DE HORAS
// ============================================================================

function getTotalBudgetHours(projectId) {
    const proj = getProject(projectId);
    if (!proj) return 0;
    return proj.phases.reduce((total, phase) => total + (phase.budgetHours || 0), 0);
}

function openBudgetModal(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;

    let body = `
        <div style="margin-bottom:16px;">
            <p style="font-size:12px; color:#7a736b; margin:0;">Defina o orçamento de horas por fase para acompanhar desvios.</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px; max-height:400px; overflow-y:auto;">
    `;

    proj.phases.forEach(phase => {
        const currentBudget = phase.budgetHours || 0;
        const actualHours = getPhaseHours(projectId, phase.key);
        
        body += `
            <div style="display:flex; align-items:center; gap:12px; padding:12px; background:#f9fafb; border-radius:4px;">
                <span class="badge bg-blue-50 text-blue-700" style="font-size:10px; width:30px; text-align:center; flex-shrink:0;">${phase.abbr}</span>
                <div style="flex:1; min-width:0;">
                    <p style="font-size:12px; font-weight:600; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${phase.name}</p>
                    <p style="font-size:10px; color:#9a928a; margin:2px 0 0;">Real: ${actualHours.toFixed(1)}h</p>
                </div>
                <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                    <input type="number" class="form-input" style="width:80px; padding:4px 8px; font-size:12px;" 
                           value="${currentBudget}" step="0.5" min="0" max="999"
                           id="budget_${phase.key}" placeholder="0">
                    <span style="font-size:11px; color:#9a928a;">h</span>
                </div>
            </div>
        `;
    });

    body += `</div>`;

    const footer = `
        <button class="btn btn-primary" onclick="saveBudgetHours('${projectId}')">Guardar</button>
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    `;

    openModal('Orçamento de Horas', body, footer);
}

function saveBudgetHours(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;

    proj.phases.forEach(phase => {
        const input = document.getElementById(`budget_${phase.key}`);
        if (input) {
            const value = parseFloat(input.value) || 0;
            phase.budgetHours = value;
        }
    });

    addHistoryEntry(projectId, 'Actualizou orçamento', 'Orçamento de horas por fase', null);
    persistAll();
    closeModal();
    showToast('Orçamento de horas actualizado');
    handleRoute();
}

// ============================================================================
// TAB 6: PENDÊNCIAS DO PROJECTO
// ============================================================================

