function markPaymentPaid(projId, scheduleIndex) {
    const proj = getProject(projId);
    if (!proj || !proj.paymentSchedule || !proj.paymentSchedule[scheduleIndex]) return;
    proj.paymentSchedule[scheduleIndex].paid = true;
    proj.paymentSchedule[scheduleIndex].paidAt = todayStr();
    persistAll();
    handleRoute();
}

function renderProjectFinancials(proj) {
    const budget = proj.budget || 0;
    const totalHours = getTotalHours(proj.id);
    const { billable, nonBillable } = getBillableHours(proj.id);

    const quote = typeof QuotesModule !== 'undefined' ? QuotesModule._list?.find(q => q.projectId === proj.id) : null;
    const rate = quote?.fees?.ratePerHour || SETTINGS.rates?.defaultHourlyRate || 75;
    const realSpent = totalHours * rate;
    const remaining = budget - realSpent;
    const pct = budget > 0 ? Math.round((realSpent / budget) * 100) : 0;

    let html = `
        <h3 style="font-size:15px; font-weight:700; margin:0 0 20px;">Resumo Financeiro</h3>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:24px;">
            <div class="card" style="padding:20px;">
                <p style="font-size:11px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Orçamento</p>
                <p style="font-size:24px; font-weight:800; margin:0;">${formatCurrency(budget)}</p>
            </div>
            <div class="card" style="padding:20px;">
                <p style="font-size:11px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Gasto Real</p>
                <p style="font-size:24px; font-weight:800; margin:0;">${formatCurrency(realSpent)}</p>
                <p style="font-size:10px; color:#9ca3af; margin:4px 0 0;">${totalHours.toFixed(1)}h × ${formatCurrency(rate)}/h</p>
            </div>
            <div class="card" style="padding:20px;">
                <p style="font-size:11px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Restante</p>
                <p style="font-size:24px; font-weight:800; margin:0; color:${remaining < 0 ? '#ef4444' : '#16a34a'};">${formatCurrency(remaining)}</p>
            </div>
            <div class="card" style="padding:20px;">
                <p style="font-size:11px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Utilizado</p>
                <p style="font-size:24px; font-weight:800; margin:0;">${pct}%</p>
            </div>
        </div>
        <div class="card" style="padding:20px; margin-bottom:24px;">
            <h4 style="font-size:13px; font-weight:700; margin:0 0 12px;">Horas</h4>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f0ece7;">
                <span>Facturáveis</span><span style="font-weight:700;">${billable.toFixed(1)}h</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f0ece7;">
                <span>Não facturáveis</span><span style="font-weight:700;">${nonBillable.toFixed(1)}h</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; font-weight:700;">
                <span>Total</span><span>${totalHours.toFixed(1)}h</span>
            </div>
        </div>
    `;

    // B) Payment Schedule
    const schedule = proj.paymentSchedule || [];
    if (schedule.length > 0) {
        const totalContract = schedule.reduce((s, p) => s + (p.amount || 0), 0);
        const totalPaid = schedule.filter(p => p.paid).reduce((s, p) => s + (p.amount || 0), 0);
        const paidPct = totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0;

        html += `
            <div class="card" style="padding:20px; margin-bottom:24px;">
                <h4 style="font-size:13px; font-weight:700; margin:0 0 12px;">Cronograma de Pagamentos</h4>
                <div style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#9ca3af; margin-bottom:4px;">
                        <span>Recebido: ${formatCurrency(totalPaid)}</span>
                        <span>${paidPct}% de ${formatCurrency(totalContract)}</span>
                    </div>
                    <div style="height:6px; background:#f3f4f6; position:relative;">
                        <div style="position:absolute; left:0; top:0; height:100%; width:${paidPct}%; background:#16a34a;"></div>
                    </div>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    <thead>
                        <tr style="background:#f9fafb; border-bottom:1px solid #eee;">
                            <th style="padding:8px 12px; text-align:left; font-weight:700; color:#6b7280; text-transform:uppercase; font-size:10px;">Descrição</th>
                            <th style="padding:8px 12px; text-align:center; font-weight:700; color:#6b7280; text-transform:uppercase; font-size:10px;">Data Prevista</th>
                            <th style="padding:8px 12px; text-align:right; font-weight:700; color:#6b7280; text-transform:uppercase; font-size:10px;">Montante</th>
                            <th style="padding:8px 12px; text-align:center; font-weight:700; color:#6b7280; text-transform:uppercase; font-size:10px;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedule.map((s, idx) => `
                            <tr style="border-bottom:1px solid #f9fafb;">
                                <td style="padding:10px 12px; font-weight:600; color:#111827;">${esc(s.description || 'Pagamento')}</td>
                                <td style="padding:10px 12px; text-align:center; color:#6b7280;">${s.dueDate || '—'}</td>
                                <td style="padding:10px 12px; text-align:right; font-weight:700; color:#111827;">${formatCurrency(s.amount || 0)}</td>
                                <td style="padding:10px 12px; text-align:center;">
                                    ${s.paid
                                        ? `<span style="font-size:10px; font-weight:800; color:#16a34a; text-transform:uppercase;">✓ Pago</span>${s.paidAt ? `<br><span style="font-size:9px; color:#9ca3af;">${s.paidAt}</span>` : ''}`
                                        : `<button class="btn btn-secondary btn-sm" style="font-size:10px; padding:4px 10px;" onclick="markPaymentPaid('${proj.id}',${idx})">Marcar como Pago</button>`
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // C) Budget vs Real comparison
    html += `<div class="card" style="padding:20px; margin-bottom:24px;">
        <h4 style="font-size:13px; font-weight:700; margin:0 0 16px;">Comparação Orçamentado vs Real por Fase</h4>`;

    if (!quote || !quote.scope?.phases?.length) {
        html += `<p style="font-size:13px; color:#9ca3af;">— Sem orçamento associado a este projecto.</p>`;
    } else {
        let totalBudgeted = 0, totalReal = 0;
        quote.scope.phases.forEach(ph => {
            const budgeted = ph.estimatedHours || 0;
            const real = getPhaseHours(proj.id, ph.id || ph.key);
            totalBudgeted += budgeted;
            totalReal += real;
            const maxH = Math.max(budgeted, real, 1);
            const overBudget = real > budgeted;
            html += `
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                        <span style="font-weight:600; color:#111827;">${esc(ph.label || ph.name || ph.id)}</span>
                        <span style="color:#6b7280;">${budgeted}h orç. / <span style="font-weight:700; color:${overBudget ? '#dc2626' : '#111827'};">${real.toFixed(1)}h real</span></span>
                    </div>
                    <div style="height:6px; background:#f3f4f6; margin-bottom:2px; position:relative;">
                        <div style="position:absolute; left:0; top:0; height:100%; width:${Math.min((budgeted/maxH)*100,100)}%; background:#e5e7eb;"></div>
                        <div style="position:absolute; left:0; top:0; height:100%; width:${Math.min((real/maxH)*100,100)}%; background:${overBudget ? '#dc2626' : '#111827'}; opacity:0.8;"></div>
                    </div>
                </div>
            `;
        });
        const totalRate = quote?.fees?.ratePerHour || SETTINGS.rates?.defaultHourlyRate || 75;
        html += `
            <div style="border-top:1px solid #e5e7eb; padding-top:12px; margin-top:4px; display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                <span>Total</span>
                <span>${totalBudgeted}h orç. / ${totalReal.toFixed(1)}h real — Gasto: ${formatCurrency(totalReal * totalRate)}</span>
            </div>
        `;
    }
    html += `</div>`;

    // [BLOCO B.3]
    if (isFullMode()) {
        const costRate = SETTINGS.rates?.roles ? null : 35; // fallback
        let internalCost = 0;
        (proj.timeLogs || []).forEach(tl => {
            const member = TEAM.members.find(m => m.id === tl.user);
            const role = member?.function || member?.role || '';
            const cr = SETTINGS.rates?.roles?.[role]?.costRate || SETTINGS.rates?.defaultCostRate || 35;
            internalCost += tl.hours * cr;
        });
        const revenue = (proj.paymentSchedule || []).filter(s => s.paid).reduce((sum, s) => sum + (s.amount || 0), 0);
        const grossMargin = revenue - internalCost;
        const marginPct = revenue > 0 ? Math.round((grossMargin / revenue) * 100) : null;

        html += `<div class="card" style="padding:20px; margin-bottom:24px;">
        <h4 style="font-size:13px; font-weight:700; margin:0 0 16px; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280;">Análise de Margem</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px;">
            <div style="text-align:center; padding:12px; background:#f9fafb; border:1px solid #eee;">
                <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Custo Interno</p>
                <p style="font-size:18px; font-weight:800; margin:0; color:#111827;">${formatCurrency(internalCost)}</p>
            </div>
            <div style="text-align:center; padding:12px; background:#f9fafb; border:1px solid #eee;">
                <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Receita Recebida</p>
                <p style="font-size:18px; font-weight:800; margin:0; color:#16a34a;">${formatCurrency(revenue)}</p>
            </div>
            <div style="text-align:center; padding:12px; background:#f9fafb; border:1px solid #eee;">
                <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Margem Bruta</p>
                <p style="font-size:18px; font-weight:800; margin:0; color:${grossMargin >= 0 ? '#16a34a' : '#dc2626'};">${formatCurrency(grossMargin)}</p>
            </div>
            <div style="text-align:center; padding:12px; background:#f9fafb; border:1px solid #eee;">
                <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">% Margem</p>
                <p style="font-size:18px; font-weight:800; margin:0; color:${marginPct !== null && marginPct >= 0 ? '#16a34a' : '#dc2626'};">${marginPct !== null ? marginPct + '%' : '—'}</p>
            </div>
        </div>
    </div>`;
    }

    return html;
}

// ============================================================================
// TAB 5: TEMPO
// ============================================================================

