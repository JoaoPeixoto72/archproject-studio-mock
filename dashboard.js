// ============================================================================
// ArchProject — dashboard.js
// Lógica do Painel Principal
// ============================================================================

function quickCheckIn(projectId) {
    navigate('projecto', { id: projectId, tab: 'obra' });
    setTimeout(() => openAddVisitModal(projectId), 250);
}

function renderAttentionPanel() {
    const today = todayStr();
    const items = [];

    // Pendências atrasadas
    PROJECTS.forEach(proj => {
        (proj.pendencias || []).filter(p => p.status === 'open' && p.deadline && p.deadline < today)
            .forEach(p => items.push({
                type: 'pendencia', color: 'var(--accent-red)', bg: '#fef2f2',
                label: 'Pendência atrasada',
                text: `${esc(p.description)} — ${esc(proj.name)}`,
                days: daysBetween(p.deadline, today),
                route: () => `navigate('projecto',{id:'${proj.id}',tab:'pendencias'})`
            }));
    });

    // Aprovações paradas >7 dias
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate()-7);
    const sevenStr = sevenAgo.toISOString().split('T')[0];
    PROJECTS.forEach(proj => {
        proj.phases.forEach(ph => {
            ph.approvals.filter(a => a.status === 'pending' && a.submittedAt && a.submittedAt < sevenStr).forEach(a => {
                items.push({
                    type: 'approval', color: 'var(--accent-yellow)', bg: '#fffbeb',
                    label: 'Aprovação parada',
                    text: `${esc(a.name)} — ${esc(proj.name)} (${esc(ph.abbr)})`,
                    sub: `Parada há ${daysBetween(a.submittedAt, today)} dias`,
                    route: () => `navigate('projecto',{id:'${proj.id}',tab:'fases'})`
                });
            });
        });
    });

    // Entregáveis de externos em atraso
    const externalIds = new Set(TEAM.externals.map(e => e.id));
    PROJECTS.forEach(proj => {
        proj.phases.filter(ph => ph.status === 'active').forEach(ph => {
            ph.deliverables.filter(d => externalIds.has(d.responsible) && d.status !== 'approved' && d.status !== 'done').forEach(d => {
                items.push({
                    type: 'external', color: 'var(--accent-blue)', bg: '#eff6ff',
                    label: 'Ação Externa Pendente',
                    text: `${esc(d.name)} — ${esc(getPersonName(d.responsible))} (${esc(proj.name)})`,
                    route: () => `navigate('projecto',{id:'${proj.id}',tab:'fases'})`
                });
            });
        });
    });

    // Pagamentos em atraso
    PROJECTS.forEach(proj => {
        (proj.paymentSchedule || []).filter(s => !s.paid && s.dueDate && s.dueDate < today).forEach(s => {
            items.push({
                type: 'payment', color: 'var(--accent-green)', bg: '#f0fdf4',
                label: 'Pagamento em atraso',
                text: `${esc(s.description || 'Pagamento')} — ${esc(proj.name)} (${formatCurrency(s.amount || 0)})`,
                route: () => `navigate('projecto',{id:'${proj.id}',tab:'financeiro'})`
            });
        });
    });

    if (items.length === 0) {
        return `<div style="padding:20px 24px; background:#f0fdf4; border-left:4px solid #16a34a; margin-bottom:32px; display:flex; align-items:center; gap:12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span style="font-size:14px; font-weight:600; color:#166534;">Tudo em dia — nenhum item requer atenção imediata.</span>
        </div>`;
    }

    const icons = {
        pendencia: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        approval: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
        external: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        payment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`
    };

    return `<div style="margin-bottom:32px; border:1px solid #e5e7eb; background:#fff;">
        <div style="padding:16px 20px; border-bottom:1px solid #f3f4f6; display:flex; align-items:center; gap:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style="font-size:13px; font-weight:800; color:#111827;">Atenção Necessária</span>
            <span style="font-size:11px; color:#9ca3af; margin-left:4px;">${items.length} item${items.length !== 1 ? 's' : ''}</span>
        </div>
        ${items.slice(0,6).map(item => `
            <div onclick="${item.route()}" style="padding:12px 20px; border-bottom:1px solid #f9fafb; border-left:3px solid ${item.color}; background:${item.bg}; cursor:pointer; display:flex; align-items:center; gap:12px;">
                <span style="color:${item.color}; flex-shrink:0;">${icons[item.type]}</span>
                <div style="flex:1; min-width:0;">
                    <span style="font-size:10px; font-weight:800; text-transform:uppercase; color:${item.color}; letter-spacing:0.5px;">${item.label}</span>
                    <p style="font-size:13px; font-weight:600; color:#111827; margin:2px 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.text}</p>
                    ${item.sub ? `<p style="font-size:11px; color:#6b7280; margin:1px 0 0;">${item.sub}</p>` : ''}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
        `).join('')}
    </div>`;
}

function renderDashboard() {
    const activeProjects = PROJECTS.filter(p => p.status === 'active');
    const pendingApprovals = getAllPendingApprovals();
    const weeklyHours = getWeeklyHours();

    const allVisits = PROJECTS.flatMap(p => (p.visits || []).map(v => ({ ...v, projectName: p.name, projectId: p.id })));
    const futureVisits = allVisits.filter(v => v.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));
    const nextVisit = futureVisits.length > 0 ? futureVisits[0] : null;
    const today = todayStr();
    
    const totalPending = PROJECTS.reduce((sum, p) =>
        sum + (p.paymentSchedule || []).filter(s => !s.paid).reduce((s, st) => s + (st.amount || 0), 0), 0);

    let revenueCard = '';
    if (isFullMode()) {
        const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);
        const thirtyStr = thirtyDays.toISOString().split('T')[0];
        const upcoming = PROJECTS.filter(p => p.status === 'active')
            .reduce((sum, p) => sum + (p.paymentSchedule || [])
                .filter(s => !s.paid && s.dueDate && s.dueDate <= thirtyStr)
                .reduce((s2, s) => s2 + (s.amount || 0), 0), 0);
        revenueCard = renderStatCard(formatCurrency(upcoming, {compact:true}), 'Receita 30 dias', 'Pagamentos previstos', 'projectos', '#2563eb');
    }
    
    // Injetar mock data de agenda se estiver vazio para demonstração
    const mockVisits = [
        { id: 'v_today_1', date: today, projectName: 'Reunião: Moradia Silva', projectId: 'p1', time: '10:00' },
        { id: 'v_today_2', date: today, projectName: 'Visita: Moradia Costa', projectId: 'p2', time: '15:30' }
    ];
    const displayVisits = futureVisits.length === 0 ? mockVisits : futureVisits.filter(v => v.date === today || v.date > today).slice(0, 5);

    let html = `
        <div class="content-container">
            <div class="page-header" style="padding:60px 0 30px;">
                <h2 style="font-size:42px; font-weight:800; margin:0; letter-spacing:-1.5px; color:#111827;">Bom dia, ${esc(APP.currentUser.name.split(' ')[0])}</h2>
                <p style="font-size:15px; color:#6b7280; font-weight:500; margin-top:8px;">O resumo do seu atelier para ${today}</p>
            </div>
            
            <div class="page-body" style="padding-top:0;">
                <!-- 1. Stats Rectangles -->
                <div style="display:grid; grid-template-columns:repeat(${isFullMode() ? 6 : 4}, 1fr); gap:16px; margin-bottom:40px;">
                    ${renderStatCard(activeProjects.length, 'Projectos Activos', activeProjects.length + ' activos', 'projectos')}
                    ${renderStatCard(pendingApprovals.length, 'Pendentes', 'Aguarda acção', 'geral-tarefas', pendingApprovals.length > 0 ? '#111827' : null)}
                    ${isFullMode() ? renderStatCard(weeklyHours.toFixed(1), 'Horas/Semana', 'Registo equipa', 'geral-tempo') : ''}
                    ${isFullMode() ? renderStatCard(formatCurrency(totalPending, { compact: true }), 'Em Aberto', 'Por cobrar', 'projectos', '#d97706') : ''}
                    ${renderStatCard(nextVisit ? nextVisit.date.split('-').reverse().slice(0,2).join('/') : '—', 'Próxima Visita', nextVisit ? nextVisit.projectName : 'Vazio', 'projectos')}
                    ${revenueCard}
                </div>

                <!-- 2. Main Grid: Attention (flex 2) and Agenda (flex 1) -->
                <div style="display:flex; gap:32px; align-items:flex-start;">
                    <div style="flex:2; min-width:0;">
                         ${renderAttentionPanel()}
                    </div>
                    
                    <div style="flex:1; min-width:300px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid #eee;">
                            <h3 style="font-size:13px; font-weight:800; margin:0; letter-spacing:0.5px; text-transform:uppercase; color:#111827;">Agenda de Hoje</h3>
                            <span style="font-size:11px; color:#9ca3af; font-weight:700;">${today.split('-').reverse().join('/')}</span>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px;">
                            ${displayVisits.map(v => {
                                const isVisit = v.projectName.toLowerCase().includes('visita');
                                return `
                                <div class="card" style="padding:16px; border:1px solid #f0ece7; border-left:4px solid #111827; background:#fff;">
                                    <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px;">
                                        <div style="display:flex; align-items:center; gap:10px;">
                                            <div style="text-align:center; padding:4px 8px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:4px;">
                                                <p style="font-size:12px; font-weight:800; margin:0; color:#111827;">${v.time || '—'}</p>
                                            </div>
                                            <div>
                                                <p style="font-size:13px; font-weight:800; margin:0; color:#111827;">${esc(v.projectName)}</p>
                                                <p style="font-size:10px; color:#9ca3af; margin:2px 0 0; text-transform:uppercase; font-weight:800;">${isVisit ? 'Visita de Obra' : 'Reunião Studio'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="display:flex; gap:8px;">
                                        ${isVisit ? `
                                            <button class="btn btn-secondary btn-xs" style="flex:1; height:32px; font-size:9px; border-radius:4px;" onclick="quickCheckIn('${v.projectId}')">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                                Check-in Foto
                                            </button>
                                        ` : ''}
                                        <button class="btn btn-secondary btn-xs" style="flex:1; height:32px; font-size:9px; border-radius:4px; opacity:0.8;" onclick="navigate('projecto',{id:'${v.projectId}', tab:'visao-geral'})">
                                            Abrir Projecto
                                        </button>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Project Momentum Summary -->
                        <div style="padding:20px; background:linear-gradient(135deg, #111827 0%, #374151 100%); color:#fff; border-radius:12px; margin-bottom:24px; position:relative; overflow:hidden;">
                             <div style="position:absolute; top:-10px; right:-10px; opacity:0.1;">
                                 <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                             </div>
                             <h4 style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin:0 0 12px; color:#9ca3af;">Project Momentum</h4>
                             <p style="font-size:13px; font-weight:500; line-height:1.5; margin:0 0 14px;">Tem <strong>3 entregas previstas</strong> para os próximos 7 dias. A carga média da equipa está nos <strong>84%</strong>.</p>
                             <button class="btn btn-xs" style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:9px;" onclick="navigate('calendario')">Ver Plano de Carga</button>
                        </div>

                        <button class="btn btn-secondary" style="width:100%; height:44px; border-radius:0; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; background:#fff; border:1px solid #e5e3dd;" onclick="navigate('calendario')">Ir para Calendário</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}
