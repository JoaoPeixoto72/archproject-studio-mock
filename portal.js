// ============================================================================
// ArchProject - portal.js
// Portal Cliente and Portal Externo implementations
// BLOCO C: Portal Cliente Melhorias (9 sections)
// BLOCO D: Portal Externo Melhorias (4 sections)
// ============================================================================

// Helper function to format date with long format (used in portals)
function formatDateLong(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Helper function to get days until date
function daysUntil(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const diff = date - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function renderPortalCliente(clientId) {
    if (!clientId) {
        document.getElementById('pageContent').innerHTML = `
            <div class="content-container">
                <div class="page-header">
                    <h2 style="font-size:32px; font-weight:800; letter-spacing:-1px;">Area de Cliente</h2>
                    <p style="color:#6b7280; font-weight:500;">Seleccione um cliente para visualizar a simulacao do portal.</p>
                </div>
                <div class="page-body">
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                        ${TEAM.clients.map(c => `
                            <div class="card" style="padding:24px; cursor:pointer;" onclick="navigate('portal-cliente', {id:'${c.id}'})">
                                <h3 style="font-size:16px; font-weight:800; margin:0 0 4px; color:#1a1714;">${esc(c.name)}</h3>
                                <p style="font-size:12px; color:#6b7280; margin:0;">${esc(c.email)}</p>
                                <div style="margin-top:16px; padding-top:12px; border-top:1px solid #f0ece7; font-size:11px; font-weight:700; color:#1a1714; text-transform:uppercase; letter-spacing:1px;">
                                    Simular Portal &rarr;
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const client = TEAM.clients.find(c => c.id === clientId);
    if (!client) {
        showToast('Cliente nao encontrado.');
        navigate('portal-cliente');
        return;
    }

    const proj = getProject(client.project);
    if (!proj) {
        document.getElementById('pageContent').innerHTML = `
            <div class="content-container">
                <div class="page-header"><h2>Area de Cliente</h2></div>
                <div class="page-body"><div class="empty-state"><p>Nenhum projecto associado a este cliente.</p></div></div>
            </div>
        `;
        return;
    }

    const progress = getProjectProgress(proj.id);
    
    // [BLOCO C.1] Dashboard metrics
    const totalValue = proj.budget || 0;
    const amountPaid = proj.budgetSpent || 0;
    const amountRemaining = totalValue - amountPaid;
    const nextPhase = proj.phases.find(ph => ph.status === 'pending') || proj.phases[proj.phases.length - 1];
    
    // [BLOCO C.2] Financial data
    const paymentSchedule = proj.paymentSchedule || [];
    const paymentHistory = paymentSchedule.filter(p => p.status === 'paid' || p.paid);
    const nextPayment = paymentSchedule.find(p => !p.status || p.status !== 'paid');
    
    // [BLOCO C.3] Client approvals
    const clientApprovals = [];
    const allApprovals = [];
    proj.phases.forEach(phase => {
        phase.approvals.forEach(apr => {
            allApprovals.push({ ...apr, phaseKey: phase.key, phaseName: phase.name });
            if (apr.type === 'client' && (apr.status === 'pending' || apr.status === 'in-review')) {
                clientApprovals.push({ ...apr, phaseKey: phase.key, phaseName: phase.name });
            }
        });
    });
    
    // [BLOCO C.4] Messages/posts
    const messages = proj.posts || [];
    
    // [BLOCO C.5] Document library
    const visibleDocs = [];
    proj.phases.forEach(phase => {
        phase.deliverables.forEach(del => {
            if (del.visibility.includes('client') && del.documents.length > 0) {
                del.documents.forEach(doc => {
                    visibleDocs.push({ ...doc, deliverableName: del.name, phaseName: phase.name, phaseKey: phase.key });
                });
            }
        });
    });
    
    // [BLOCO C.6] Site visits
    const visits = proj.visits || [];
    
    // [BLOCO C.8] Contact directory
    const coordinatorId = (proj.team?.members || []).find(id => {
        const m = TEAM.members.find(x => x.id === id);
        return m && m.role === 'admin';
    });
    const coordinatorMember = coordinatorId ? TEAM.members.find(m => m.id === coordinatorId) : null;
    const teamMembers = proj.team?.members?.map(id => TEAM.members.find(m => m.id === id)).filter(Boolean) || [];
    const externals = proj.team?.externals?.map(id => TEAM.externals.find(e => e.id === id)).filter(Boolean) || [];

    let html = `
        <div style="background:#f9fafb; min-height:100vh; position:fixed; top:0; left:0; right:0; bottom:0; width:100%; z-index:9999; overflow-y:auto; padding:0; display:flex; flex-direction:column; font-family:'Inter', sans-serif;">
            
            <div style="background:#fff; border-bottom:1px solid #eee; padding:20px 60px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:10;">
                <div style="display:flex; align-items:center; gap:24px;">
                    <div style="font-family:'Playfair Display', serif; font-weight:900; font-size:20px; letter-spacing:-0.5px; color:#1a1714;">ATELIER<span style="color:#d97706;">.</span></div>
                    <div style="height:20px; width:1px; background:#eee;"></div>
                    <span style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#9ca3af;">Area Pessoal de Cliente</span>
                </div>
                <div style="display:flex; align-items:center; gap:32px;">
                    <div style="text-align:right;">
                        <p style="font-size:12px; font-weight:700; color:#111827; margin:0;">${esc(client.name)}</p>
                        <p style="font-size:10px; color:#9ca3af; margin:0; text-transform:uppercase; letter-spacing:0.5px;">Proprietario</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" style="border-radius:0;" onclick="navigate('portal-cliente')">Voltar ao Atelier</button>
                </div>
            </div>

            <div class="content-container" style="max-width:1200px; margin:60px auto; padding:0 60px; flex:1;">
                <div style="display:grid; grid-template-columns:1fr 340px; gap:60px; align-items:start;">
                    
                    <div>
                        <div style="margin-bottom:48px;">
                            <h1 style="font-size:42px; font-weight:800; letter-spacing:-2px; margin:0 0 12px; color:#1a1714;">${esc(proj.name)}</h1>
                            <p style="font-size:16px; color:#6b7280; line-height:1.6; max-width:600px; margin-bottom:40px;">Acompanhe o progresso e comunique com a equipa do projecto.</p>

                            <!-- Linha do Tempo (Timeline) -->
                            <div>
                                <h3 class="section-title" style="margin:0 0 24px;">Progresso do Projecto</h3>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                                     <button class="btn btn-secondary btn-xs" style="font-size:10px; padding:6px 12px;" onclick="downloadProjectICal('${proj.id}')">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        Sincronizar com Calendário Pessoal
                                    </button>
                                </div>
                                <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:stretch;">
                                    ${proj.phases.map((ph, idx) => {
                                        const isCompleted = ph.status === 'done';
                                        const isInProgress = ph.status === 'active' || ph.status === 'in-progress';
                                        const isPending = ph.status === 'pending';
                                        
                                        let icon = '<div style="width:12px; height:12px; border-radius:50%; background:#d1d5db;"></div>';
                                        let borderColor = '#e5e7eb';
                                        let bgColor = '#fff';
                                        let titleColor = '#9ca3af';
                                        let barHtml = '';
                                        
                                        if (isCompleted) {
                                            icon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                                            borderColor = '#10b981';
                                            bgColor = '#ecfdf5';
                                            titleColor = '#065f46';
                                        } else if (isInProgress) {
                                            icon = '<div style="width:10px; height:10px; border-radius:50%; background:#f59e0b; box-shadow: 0 0 0 4px #fef3c7;"></div>';
                                            borderColor = '#f59e0b';
                                            bgColor = '#fff';
                                            titleColor = '#92400e';
                                            
                                            const phaseProgress = Math.floor(Math.random() * 40) + 30;
                                            barHtml = `
                                                <div style="margin-top:12px;">
                                                    <div style="display:flex; justify-content:space-between; font-size:9px; font-weight:800; color:#d97706; text-transform:uppercase; margin-bottom:4px;">
                                                        <span>Em Curso</span>
                                                        <span>${phaseProgress}% concluido</span>
                                                    </div>
                                                    <div style="height:4px; background:#fef3c7; border-radius:2px; overflow:hidden;">
                                                        <div style="height:100%; width:${phaseProgress}%; background:#f59e0b;"></div>
                                                    </div>
                                                </div>
                                            `;
                                        }

                                        const friendlyNames = {
                                            'la': 'Plantas finais e processo pronto a submeter a Camara.',
                                            'pe': 'Mapa de quantidades e caderno de encargos detalhados.',
                                            'at': 'Construcao finalizada e emissao de alvara.'
                                        };
                                        const friendlyName = friendlyNames[ph.key] || ph.name;
                                        const descriptions = {
                                            'pp': 'Definicao do conceito inicial, moodboards e layout.',
                                            'la': 'Preparacao formal e submissao a Camara Municipal.',
                                            'pe': 'Desenhos tecnicos detalhados e mapa de quantidades.',
                                            'at': 'Apoio tecnico no local ao longo da construcao.'
                                        };
                                        const desc = descriptions[ph.key] || 'Desenvolvimento das bases deste capitulo.';

                                        return `
                                            <div style="flex:1; min-width:220px; border:1px solid ${borderColor}; background:${bgColor}; padding:16px; position:relative;">
                                                ${idx < proj.phases.length - 1 ? `<div style="position:absolute; top:24px; right:-16px; width:16px; height:1px; background:${isCompleted ? '#10b981' : '#e5e7eb'}; z-index:0;"></div>` : ''}
                                                
                                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                                                    <div style="width:24px; height:24px; border-radius:50%; background:${isCompleted ? '#10b981' : (isInProgress ? '#fff' : '#f3f4f6')}; border:1px solid ${isCompleted ? '#10b981' : (isInProgress ? '#f59e0b' : '#d1d5db')}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                                        ${icon}
                                                    </div>
                                                    <div style="font-size:13px; font-weight:800; color:${titleColor}; line-height:1.2;">
                                                        ${esc(friendlyName)}
                                                    </div>
                                                </div>
                                                
                                                <div style="font-size:11px; color:#6b7280; line-height:1.5;">${esc(desc)}</div>
                                                ${barHtml}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- [BLOCO C.1] Dashboard with key metrics -->
                        <div style="margin-bottom:48px;">
                            <h3 class="section-title" style="margin:0 0 24px;">Dashboard do Projecto</h3>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                <div class="card" style="padding:20px;">
                                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:8px;">Estado Geral</div>
                                    <div style="font-size:28px; font-weight:800; color:#111827; margin-bottom:12px;">${progress}%</div>
                                    <div style="height:4px; background:#f3f4f6; border-radius:2px; overflow:hidden;">
                                        <div style="height:100%; width:${progress}%; background:#111827;"></div>
                                    </div>
                                </div>
                                <div class="card" style="padding:20px;">
                                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:8px;">Fase Actual</div>
                                    <div style="font-size:16px; font-weight:800; color:#111827; margin-bottom:4px;">${esc(nextPhase?.name || 'N/A')}</div>
                                    <div style="font-size:11px; color:#9ca3af;">${esc(nextPhase?.description?.substring(0, 50) || '')}</div>
                                </div>
                            </div>
                        </div>

                        <!-- [BLOCO C.2] Financial view with payment tracking -->
                        <div style="margin-bottom:48px;">
                            <h3 class="section-title" style="margin:0 0 24px;">Situacao Financeira</h3>
                            <div class="card" style="padding:24px;">
                                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:24px;">
                                    <div>
                                        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Valor Total</div>
                                        <div style="font-size:20px; font-weight:800; color:#111827;">${formatCurrency(totalValue)}</div>
                                    </div>
                                    <div>
                                        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Pago</div>
                                        <div style="font-size:20px; font-weight:800; color:#10b981;">${formatCurrency(amountPaid)}</div>
                                    </div>
                                    <div>
                                        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Pendente</div>
                                        <div style="font-size:20px; font-weight:800; color:#ef4444;">${formatCurrency(amountRemaining)}</div>
                                    </div>
                                </div>
                                <div style="margin-bottom:16px;">
                                    <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:800; color:#6b7280; text-transform:uppercase; margin-bottom:8px;">
                                        <span>Progresso de Pagamento</span>
                                        <span>${totalValue > 0 ? Math.round((amountPaid / totalValue) * 100) : 0}%</span>
                                    </div>
                                    <div style="height:6px; background:#f3f4f6; border-radius:3px; overflow:hidden;">
                                        <div style="height:100%; width:${totalValue > 0 ? (amountPaid / totalValue) * 100 : 0}%; background:#10b981;"></div>
                                    </div>
                                </div>
                                ${nextPayment ? `
                                    <div style="padding:12px; background:#fef3c7; border-left:3px solid #f59e0b;">
                                        <div style="font-size:11px; font-weight:800; color:#92400e; margin-bottom:4px;">Proximo Pagamento</div>
                                        <div style="font-size:13px; font-weight:700; color:#111827;">${formatCurrency(nextPayment.amount || 0)}</div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- [BLOCO C.3] Decisions/approvals section -->
                        <div style="margin-bottom:48px;">
                            <h3 class="section-title" style="margin:0 0 24px;">Aprovacoes Pendentes</h3>
                            <div class="card" style="padding:0; overflow:hidden;">
                                ${clientApprovals.length > 0 ? `
                                    <div style="display:flex; flex-direction:column;">
                                        ${clientApprovals.map((apr, i) => `
                                            <div style="padding:16px 24px; ${i < clientApprovals.length - 1 ? 'border-bottom:1px solid #f9fafb;' : ''}">
                                                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                                                    <div>
                                                        <div style="font-size:13px; font-weight:700; color:#111827;">${esc(apr.name)}</div>
                                                        <div style="font-size:11px; color:#9ca3af;">Fase: ${esc(apr.phaseName)}</div>
                                                    </div>
                                                    <span style="font-size:10px; font-weight:800; background:#fef3c7; color:#92400e; padding:4px 8px; text-transform:uppercase;">Pendente</span>
                                                </div>
                                                <div style="display:flex; gap:8px; margin-top:12px;">
                                                    <button class="btn btn-primary btn-xs" style="border-radius:0; flex:1;" onclick="showToast('Aprovacao registada')">Aprovar</button>
                                                    <button class="btn btn-secondary btn-xs" style="border-radius:0; flex:1;" onclick="showToast('Rejeicao registada')">Rejeitar</button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="padding:32px; text-align:center; color:#9ca3af;">Nenhuma aprovacao pendente.</div>
                                `}
                            </div>
                        </div>

                        <!-- [BLOCO C.4] Communication/messages -->
                        <div style="margin-bottom:48px;">
                            <h3 class="section-title" style="margin:0 0 24px;">Comunicacoes do Projecto</h3>
                            <div class="card" style="padding:24px;">
                                ${messages.length > 0 ? `
                                    <div style="display:flex; flex-direction:column; gap:12px;">
                                        ${messages.slice(0, 3).map(msg => `
                                            <div style="padding:12px; background:#f9fafb; border-left:3px solid #2563eb;">
                                                <div style="font-size:12px; font-weight:700; color:#111827; margin-bottom:4px;">${esc(msg.title || 'Mensagem')}</div>
                                                <div style="font-size:11px; color:#6b7280;">${esc(msg.content?.substring(0, 80) || '')}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="text-align:center; color:#9ca3af; padding:20px;">Nenhuma mensagem neste momento.</div>
                                `}
                            </div>
                        </div>

                        <!-- [BLOCO C.5] Document library improvements -->
                        <div style="margin-bottom:48px;">
                            <h3 class="section-title" style="margin:0 0 24px;">Biblioteca de Projecto</h3>
                            <div class="card" style="padding:0; overflow:hidden;">
                                <table style="width:100%; border-collapse:collapse;">
                                    <thead style="background:#f9fafb; border-bottom:1px solid #eee;">
                                        <tr>
                                            <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Ficheiro</th>
                                            <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Fase</th>
                                            <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Tamanho</th>
                                            <th style="padding:12px 24px; text-align:right;"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${visibleDocs.map((f, i) => `
                                            <tr style="${i < visibleDocs.length - 1 ? 'border-bottom:1px solid #f9fafb;' : ''}">
                                                <td style="padding:16px 24px;">
                                                    <div style="font-size:13px; font-weight:700; color:#111827;">${esc(f.filename)}</div>
                                                    <div style="font-size:11px; color:#9ca3af;">v${f.version}</div>
                                                </td>
                                                <td style="padding:16px 24px; font-size:12px; color:#6b7280; font-weight:500;">${esc(f.phaseName)}</td>
                                                <td style="padding:16px 24px; font-size:12px; color:#6b7280;">${f.size || 'N/A'}</td>
                                                <td style="padding:16px 24px; text-align:right;">
                                                    <button class="btn btn-secondary btn-xs" style="border-radius:0;" onclick="showToast('A preparar download...')">Download</button>
                                                </td>
                                            </tr>
                                        `).join('') || '<tr><td colspan="4" style="padding:32px; text-align:center; color:#9ca3af;">Aguarde pela publicacao de documentos.</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- [BLOCO C.6] Site visits tracking -->
                        <div style="margin-bottom:48px;">
                            <h3 class="section-title" style="margin:0 0 24px;">Visitas ao Terreno</h3>
                            <div class="card" style="padding:0; overflow:hidden;">
                                ${visits.length > 0 ? `
                                    <div style="display:flex; flex-direction:column;">
                                        ${visits.map((v, i) => `
                                            <div style="padding:16px 24px; ${i < visits.length - 1 ? 'border-bottom:1px solid #f9fafb;' : ''}">
                                                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                                                    <div>
                                                        <div style="font-size:13px; font-weight:700; color:#111827;">${formatDateLong(v.date)}</div>
                                                        <div style="font-size:11px; color:#9ca3af;">${v.participants?.length || 0} participantes</div>
                                                    </div>
                                                    ${v.photos?.length > 0 ? `<span style="font-size:10px; background:#ecfdf5; color:#065f46; padding:4px 8px; text-transform:uppercase; font-weight:800;">${v.photos.length} fotos</span>` : ''}
                                                </div>
                                                <div style="font-size:12px; color:#6b7280; margin-top:8px;">${esc(v.notes || '')}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="padding:32px; text-align:center; color:#9ca3af;">Nenhuma visita registada.</div>
                                `}
                            </div>
                        </div>

                        <!-- [BLOCO C.7] Project timeline -->
                        <div style="margin-bottom:48px;">
                            <h3 class="section-title" style="margin:0 0 24px;">Cronograma do Projecto</h3>
                            <div class="card" style="padding:24px;">
                                <div style="display:flex; flex-direction:column; gap:16px;">
                                    ${proj.phases.map(ph => {
                                        const statusColor = ph.status === 'done' ? '#10b981' : (ph.status === 'active' ? '#f59e0b' : '#d1d5db');
                                        const statusLabel = ph.status === 'done' ? 'Concluido' : (ph.status === 'active' ? 'Em Curso' : 'Pendente');
                                        return `
                                            <div style="display:flex; align-items:center; gap:12px;">
                                                <div style="width:12px; height:12px; border-radius:50%; background:${statusColor}; flex-shrink:0;"></div>
                                                <div style="flex:1;">
                                                    <div style="font-size:12px; font-weight:700; color:#111827;">${esc(ph.name)}</div>
                                                    <div style="font-size:10px; color:#9ca3af;">${formatDateLong(ph.startDate)} - ${formatDateLong(ph.endDate)}</div>
                                                </div>
                                                <span style="font-size:10px; font-weight:800; color:${statusColor}; text-transform:uppercase;">${statusLabel}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="position:sticky; top:120px;">
                        <!-- [BLOCO C.8] Contact directory -->
                        <div style="margin-bottom:24px;">
                            <h3 class="section-title" style="margin:0 0 16px; font-size:13px;">Directorio de Contactos</h3>
                            <div class="card" style="padding:16px;">
                                ${coordinatorMember ? `
                                    <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f9fafb;">
                                        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Coordenador</div>
                                        <div style="font-size:12px; font-weight:700; color:#111827;">${esc(coordinatorMember.name)}</div>
                                        <div style="font-size:10px; color:#9ca3af; margin-top:4px;">
                                            ${coordinatorMember.email ? `<div>${esc(coordinatorMember.email)}</div>` : ''}
                                            ${coordinatorMember.phone ? `<div>${esc(coordinatorMember.phone)}</div>` : ''}
                                        </div>
                                    </div>
                                ` : ''}
                                ${teamMembers.length > 0 ? `
                                    <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f9fafb;">
                                        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:8px;">Equipa Interna</div>
                                        ${teamMembers.map(m => `
                                            <div style="margin-bottom:8px;">
                                                <div style="font-size:11px; font-weight:700; color:#111827;">${esc(m.name)}</div>
                                                <div style="font-size:9px; color:#9ca3af;">${esc(m.function || m.role)}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                ${externals.length > 0 ? `
                                    <div>
                                        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:8px;">Especialistas</div>
                                        ${externals.map(e => `
                                            <div style="margin-bottom:8px;">
                                                <div style="font-size:11px; font-weight:700; color:#111827;">${esc(e.name)}</div>
                                                <div style="font-size:9px; color:#9ca3af;">${esc(e.specialty)}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- [BLOCO C.9] Client profile -->
                        <div>
                            <h3 class="section-title" style="margin:0 0 16px; font-size:13px;">Perfil do Cliente</h3>
                            <div class="card" style="padding:16px;">
                                <div style="margin-bottom:12px;">
                                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Nome</div>
                                    <div style="font-size:12px; font-weight:700; color:#111827;">${esc(client.name)}</div>
                                </div>
                                <div style="margin-bottom:12px;">
                                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Email</div>
                                    <div style="font-size:11px; color:#2563eb; word-break:break-all;">${esc(client.email)}</div>
                                </div>
                                <div style="margin-bottom:12px;">
                                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Telefone</div>
                                    <div style="font-size:11px; color:#111827;">${esc(client.phone || 'N/A')}</div>
                                </div>
                                <div style="padding-top:12px; border-top:1px solid #f9fafb;">
                                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:4px;">Projecto</div>
                                    <div style="font-size:12px; font-weight:700; color:#111827;">${esc(proj.name)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}

function downloadProjectICal(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;
    
    let ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ArchProject//Project Calendar//PT',
        'X-WR-CALNAME:' + proj.name,
        'CALSCALE:GREGORIAN'
    ];
    
    proj.phases.forEach(ph => {
        if (!ph.startDate || !ph.endDate) return;
        
        const startStr = ph.startDate.replace(/-/g, '');
        // iCal DATE value requires the day after the end of event for all-day events
        const endDate = new Date(ph.endDate);
        endDate.setDate(endDate.getDate() + 1);
        const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
        
        ical.push('BEGIN:VEVENT');
        ical.push('UID:' + ph.key + '_' + proj.id + '@archproject.studio');
        ical.push('DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z');
        ical.push('DTSTART;VALUE=DATE:' + startStr);
        ical.push('DTEND;VALUE=DATE:' + endStr);
        ical.push('SUMMARY:' + proj.name + ' - ' + ph.name);
        ical.push('DESCRIPTION:' + (ph.description || 'Fase do projecto'));
        ical.push('END:VEVENT');
    });
    
    ical.push('END:VCALENDAR');
    
    const blob = new Blob([ical.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projecto_${proj.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Ficheiro iCalendar (.ics) gerado');
}

function renderPortalExterno(externalId) {
    if (!externalId) {
        document.getElementById('pageContent').innerHTML = `
            <div class="content-container">
                <div class="page-header">
                    <h2 style="font-size:32px; font-weight:800; letter-spacing:-1px;">Area de Colaborador Externo</h2>
                    <p style="color:#6b7280; font-weight:500;">Seleccione um colaborador para visualizar a simulacao do portal.</p>
                </div>
                <div class="page-body">
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                        ${TEAM.externals.map(e => `
                            <div class="card" style="padding:24px; cursor:pointer;" onclick="navigate('portal-externo', {id:'${e.id}'})">
                                <h3 style="font-size:16px; font-weight:800; margin:0 0 4px; color:#1a1714;">${esc(e.name)}</h3>
                                <p style="font-size:12px; color:#6b7280; margin:0;">${esc(e.specialty)}</p>
                                <div style="margin-top:16px; padding-top:12px; border-top:1px solid #f0ece7; font-size:11px; font-weight:700; color:#1a1714; text-transform:uppercase; letter-spacing:1px;">
                                    Simular Portal &rarr;
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const ext = TEAM.externals.find(e => e.id === externalId);
    if (!ext) {
        showToast('Colaborador nao encontrado.');
        navigate('portal-externo');
        return;
    }

    const myProjects = PROJECTS.filter(p => p.team?.externals?.includes(ext.id));

    // [BLOCO D.1] Deliverables alerts
    const deliverableAlerts = [];
    myProjects.forEach(proj => {
        proj.phases.forEach(phase => {
            phase.deliverables.forEach(del => {
                if (del.responsible === ext.id || del.visibility.includes('external')) {
                    const daysLeft = daysUntil(phase.endDate);
                    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
                        deliverableAlerts.push({ ...del, phaseName: phase.name, projectName: proj.name, daysLeft, type: 'due-soon' });
                    } else if (daysLeft !== null && daysLeft < 0) {
                        deliverableAlerts.push({ ...del, phaseName: phase.name, projectName: proj.name, daysLeft, type: 'overdue' });
                    }
                }
            });
        });
    });

    let html = `
        <div style="background:#f9fafb; min-height:100vh; position:fixed; top:0; left:0; right:0; bottom:0; width:100%; z-index:9999; overflow-y:auto; font-family:'Inter', sans-serif;">
            <!-- Header -->
            <div style="background:#1a1714; color:#fff; padding:20px 60px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:10;">
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="font-family:'Playfair Display',serif; font-weight:900; font-size:18px;">ATELIER<span style="color:#d97706;">.</span></div>
                    <span style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#9ca3af;">Portal de Colaborador</span>
                </div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="text-align:right;">
                        <p style="font-size:12px; font-weight:700; color:#fff; margin:0;">${esc(ext.name)}</p>
                        <p style="font-size:10px; color:#9a928a; margin:0;">${esc(ext.specialty)}</p>
                    </div>
                    <button style="background:#332f2c; color:#fff; border:none; padding:8px 16px; font-size:11px; font-weight:700; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px;" onclick="exitPortal()">Sair</button>
                </div>
            </div>

            <!-- Content -->
            <div class="content-container" style="max-width:1200px; margin:60px auto; padding:0 60px;">
                <h1 style="font-size:42px; font-weight:800; letter-spacing:-2px; margin:0 0 12px; color:#1a1714;">Meus Projectos</h1>
                <p style="font-size:16px; color:#6b7280; line-height:1.6; margin-bottom:40px;">Acompanhe os entregaveis atribuidos e comunique com o atelier.</p>

                <!-- [BLOCO D.1] Deliverables alerts -->
                ${deliverableAlerts.length > 0 ? `
                    <div style="margin-bottom:40px;">
                        <h3 class="section-title" style="margin:0 0 16px;">Alertas de Entregaveis</h3>
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
                            ${deliverableAlerts.map(alert => {
                                const alertColor = alert.type === 'overdue' ? '#ef4444' : '#f59e0b';
                                const alertBg = alert.type === 'overdue' ? '#fef2f2' : '#fef3c7';
                                const alertLabel = alert.type === 'overdue' ? 'ATRASADO' : 'VENCE EM BREVE';
                                return `
                                    <div style="padding:16px; background:${alertBg}; border-left:4px solid ${alertColor};">
                                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                                            <div>
                                                <div style="font-size:12px; font-weight:700; color:#111827;">${esc(alert.name)}</div>
                                                <div style="font-size:10px; color:#6b7280;">${esc(alert.projectName)} - ${esc(alert.phaseName)}</div>
                                            </div>
                                            <span style="font-size:9px; font-weight:800; color:${alertColor}; text-transform:uppercase;">${alertLabel}</span>
                                        </div>
                                        <div style="font-size:11px; font-weight:700; color:${alertColor};">
                                            ${alert.type === 'overdue' ? `${Math.abs(alert.daysLeft)} dias atrasado` : `${alert.daysLeft} dias restantes`}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Projects with D.2, D.3, D.4 sections -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap:32px;">
                    ${myProjects.map(proj => {
                        const activePhase = proj.phases.find(ph => ph.status === 'active' || ph.status === 'in-progress') || proj.phases[proj.phases.length - 1];
                        const myDeliverables = [];
                        if (activePhase) {
                            activePhase.deliverables.forEach(del => {
                                if (del.responsible === ext.id || del.visibility.includes('external')) {
                                    myDeliverables.push(del);
                                }
                            });
                        }
                        const coordinatorId = (proj.team?.members || []).find(id => {
                            const m = TEAM.members.find(x => x.id === id);
                            return m && m.role === 'admin';
                        });
                        const coordinatorInfo = coordinatorId ? TEAM.members.find(m => m.id === coordinatorId) : null;
                        
                        return `
                            <div class="card" style="padding:24px; border-color:#e5e7eb;">
                                <!-- [BLOCO D.4] Project info -->
                                <div style="margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #f9fafb;">
                                    <h2 style="font-size:18px; font-weight:800; margin:0 0 8px; color:#1a1714;">${esc(proj.name)}</h2>
                                    <div style="font-size:11px; color:#9ca3af; margin-bottom:8px;">
                                        <div>${esc(proj.location || 'Localizacao nao definida')}</div>
                                        <div>Fase: ${activePhase ? esc(activePhase.name) : 'N/A'}</div>
                                    </div>
                                    <div style="display:flex; gap:8px; margin-top:8px;">
                                        <span style="font-size:10px; background:#f3f4f6; color:#6b7280; padding:4px 8px; border-radius:2px;">Area: ${proj.area}m²</span>
                                        <span style="font-size:10px; background:#f3f4f6; color:#6b7280; padding:4px 8px; border-radius:2px;">Orcamento: ${formatCurrency(proj.budget)}</span>
                                    </div>
                                </div>

                                <!-- [BLOCO D.2] Upload notes and deliverables -->
                                <div style="margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #f9fafb;">
                                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:12px;">Entregaveis Atribuidos</div>
                                    ${myDeliverables.length > 0 ? `
                                        <div style="display:flex; flex-direction:column; gap:8px;">
                                            ${myDeliverables.map(del => {
                                                const statusColors = { 'pending': '#f3f4f6', 'in-progress': '#fef3c7', 'done': '#ecfdf5', 'approved': '#ecfdf5' };
                                                const statusTextColors = { 'pending': '#6b7280', 'in-progress': '#92400e', 'done': '#065f46', 'approved': '#065f46' };
                                                return `
                                                    <div style="padding:12px; background:${statusColors[del.status] || '#f3f4f6'}; border-left:3px solid ${statusTextColors[del.status] === '#6b7280' ? '#d1d5db' : (statusTextColors[del.status] === '#92400e' ? '#f59e0b' : '#10b981')};">
                                                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
                                                            <div style="font-size:12px; font-weight:700; color:#111827;">${esc(del.name)}</div>
                                                            <span style="font-size:9px; font-weight:800; color:${statusTextColors[del.status]}; text-transform:uppercase;">${del.status}</span>
                                                        </div>
                                                        <div style="font-size:10px; color:#6b7280; margin-bottom:8px;">${esc(del.description)}</div>
                                                        <div style="display:flex; gap:6px;">
                                                            <button class="btn btn-secondary btn-xs" style="border-radius:0; font-size:9px; padding:4px 8px;" onclick="showToast('Documento carregado')">+ Carregar</button>
                                                            <button class="btn btn-secondary btn-xs" style="border-radius:0; font-size:9px; padding:4px 8px;" onclick="showToast('Nota adicionada')">+ Nota</button>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    ` : `
                                        <p style="font-size:12px; color:#9ca3af;">Nenhum entregavel atribuido nesta fase.</p>
                                    `}
                                </div>

                                <!-- [BLOCO D.3] Communication -->
                                <div>
                                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#6b7280; margin-bottom:12px;">Comunicacao</div>
                                    ${coordinatorInfo ? `
                                        <div style="padding:12px; background:#f9fafb; border-left:3px solid #2563eb; margin-bottom:12px;">
                                            <div style="font-size:11px; font-weight:700; color:#111827; margin-bottom:4px;">Coordenador do Projecto</div>
                                            <div style="font-size:11px; color:#6b7280; margin-bottom:8px;">
                                                <div>${esc(coordinatorInfo.name)}</div>
                                                <div>${esc(coordinatorInfo.email)}</div>
                                            </div>
                                            <button class="btn btn-primary btn-xs" style="border-radius:0; font-size:9px; padding:4px 8px;" onclick="showToast('Mensagem enviada')">Enviar Mensagem</button>
                                        </div>
                                    ` : ''}
                                    <div style="display:flex; gap:8px;">
                                        <button class="btn btn-secondary btn-xs" style="border-radius:0; flex:1;" onclick="showToast('Ver historico de mensagens')">Ver Historico</button>
                                        <button class="btn btn-secondary btn-xs" style="border-radius:0; flex:1;" onclick="showToast('Nova mensagem')">Nova Msg</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('') || '<p style="color:#9ca3af; font-size:14px;">Nenhum projecto atribuido.</p>'}
                </div>
            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}
