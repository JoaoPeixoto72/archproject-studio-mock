// ============================================================================
// PROJECT & TEAM MUTATIONS
// ============================================================================

function createNewProject(projectData) {
    const projId = projectData.id || generateId('PRJ');
    const newProject = {
        ...projectData,
        id: projId,
        createdAt: todayStr(),
        history: [{
            date: todayStr(),
            user: APP.currentUser.id,
            action: 'Criou projecto',
            detail: projectData.historyDetail || projectData.name,
            phase: null
        }]
    };
    
    PROJECTS.push(newProject);
    persistAll();
    return newProject;
}

function upsertTeamMember(type, memberData, existingId = null) {
    let item;
    const listKey = type === 'member' ? 'members' : type === 'external' ? 'externals' : 'clients';
    
    if (existingId) {
        item = TEAM[listKey].find(m => m.id === existingId);
        if (!item) return null;
        Object.assign(item, memberData);
    } else {
        item = {
            id: generateId(type.substring(0, 1)),
            projects: [],
            ...memberData
        };
        TEAM[listKey].push(item);
    }
    
    persistAll();
    return item;
}

function addDeliverable(projectId, phaseKey, delData) {
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return null;
    
    const newDel = {
        id: generateId('del'),
        status: 'pending',
        visibility: ['admin', 'member'],
        notes: [],
        documents: [],
        ...delData
    };
    
    phase.deliverables.push(newDel);
    addHistoryEntry(projectId, 'Adicionou entregável', newDel.name, phaseKey);
    persistAll();
    return newDel;
}

// ============================================================================
// LOGS & TIME MUTATIONS
// ============================================================================

function addTimeLog(projectId, entry) {
    const proj = getProject(projectId);
    if (!proj) return;
    if (!proj.timeLogs) proj.timeLogs = [];
    
    // Validação
    if (!entry.hours || entry.hours <= 0) {
        showToast('Horas deve ser maior que 0');
        return;
    }
    if (!entry.phase || entry.phase.trim() === '') {
        showToast('Fase é obrigatória');
        return;
    }
    if (!entry.description || entry.description.trim() === '') {
        showToast('Descrição é obrigatória');
        return;
    }
    
    const fullEntry = {
        id: generateId(),
        user: entry.user || APP.currentUser.id,
        date: entry.date || todayStr(),
        hours: entry.hours,
        phase: entry.phase,
        description: entry.description,
        billable: entry.billable !== false
    };
    proj.timeLogs.unshift(fullEntry);
    addHistoryEntry(projectId, 'Registou tempo', `${entry.description} (${entry.hours}h)`, entry.phase);
    persistAll();
    return fullEntry;
}

function updatePendencia(projectId, pendId, changes) {
    const proj = getProject(projectId);
    if (!proj) return;
    const pend = (proj.pendencias || []).find(p => p.id === pendId);
    if (!pend) return;
    Object.assign(pend, changes);
    addHistoryEntry(projectId, 'Actualizou pendência', pend.description, pend.phase);
    persistAll();
    return pend;
}

function addPendencia(projectId, pendencia) {
    const proj = getProject(projectId);
    if (!proj) return;
    if (!proj.pendencias) proj.pendencias = [];
    
    // Validação
    if (!pendencia.description || pendencia.description.trim() === '') {
        showToast('Descrição é obrigatória');
        return;
    }
    
    const fullPend = {
        id: generateId(),
        description: pendencia.description,
        priority: pendencia.priority || 'medium',
        responsible: pendencia.responsible,
        deadline: pendencia.deadline,
        status: 'open',
        phase: pendencia.phase,
        createdAt: todayStr()
    };
    proj.pendencias.push(fullPend);
    addHistoryEntry(projectId, 'Criou pendência', pendencia.description, pendencia.phase);
    persistAll();
    return fullPend;
}

function updatePhaseStatus(projectId, phaseKey, status, endDateActual) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const oldStatus = phase.status;
    // Normalizar alias retroactivo: 'completed' → 'done' para fases
    const normalizedStatus = status === 'completed' ? 'done' : status;
    phase.status = normalizedStatus;
    if (normalizedStatus === 'active' && !phase.startDate) phase.startDate = todayStr();
    if (normalizedStatus === 'done' && endDateActual) phase.endDateActual = endDateActual;
    addHistoryEntry(projectId, `Fase ${normalizedStatus}`, phase.name, phaseKey);
    persistAll();
    return phase;
}

function updateApprovalStatus(projectId, phaseKey, approvalId, status, notes) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const apr = (phase.approvals || []).find(a => a.id === approvalId);
    if (!apr) return;
    apr.status = status;
    apr.notes = notes || '';
    if (status === 'approved' || status === 'rejected') {
        apr.respondedAt = todayStr();
        apr.respondedBy = APP.currentUser.id;
    }
    addHistoryEntry(projectId, `${status} aprovação`, apr.name, phaseKey);
    persistAll();
    return apr;
}

function addVisitToProject(projectId, visit) {
    const proj = getProject(projectId);
    if (!proj) return;
    if (!proj.visits) proj.visits = [];
    
    // Validação
    if (!visit.date || visit.date.trim() === '') {
        showToast('Data é obrigatória');
        return;
    }
    
    const fullVisit = {
        id: generateId(),
        date: visit.date || todayStr(),
        participants: visit.participants || [],
        notes: visit.notes || '',
        photos: (visit.photos || []).map(p => {
            if (typeof p === 'string') {
                return { id: generateId('ph'), filename: p, date: visit.date || todayStr(), uploadedBy: APP.currentUser.id };
            }
            return p;
        }),
        actions: visit.actions || [],
        summary: visit.summary || '',
        status: visit.status || 'completed'
    };
    proj.visits.push(fullVisit);
    addHistoryEntry(projectId, 'Registou visita', visit.notes || visit.summary, null);
    persistAll();
    return fullVisit;
}

function removeVisitPhoto(projectId, visitId, photoId) {
    const proj = getProject(projectId);
    if (!proj) return false;
    const visit = proj.visits.find(v => v.id === visitId);
    if (!visit || !visit.photos) return false;
    
    const count = visit.photos.length;
    visit.photos = visit.photos.filter(p => p.id !== photoId);
    
    if (visit.photos.length < count) {
        persistAll();
        return true;
    }
    return false;
}

function addPhotosToVisit(projectId, visitId, newPhotos) {
    const proj = getProject(projectId);
    if (!proj) return false;
    const visit = proj.visits.find(v => v.id === visitId);
    if (!visit) return false;
    
    if (!visit.photos) visit.photos = [];
    visit.photos.push(...newPhotos);
    
    persistAll();
    return true;
}

function updateVisitAction(projectId, visitId, actionId, checked) {
    const proj = getProject(projectId);
    if (!proj) return;
    const visit = (proj.visits || []).find(v => v.id === visitId);
    if (!visit) return;
    const action = (visit.actions || []).find(a => a.id === actionId);
    if (!action) return;
    action.status = checked ? 'done' : 'open';
    persistAll();
    return action;
}

function addPostToProject(projectId, post) {
    const proj = getProject(projectId);
    if (!proj) return;
    if (!proj.posts) proj.posts = [];
    
    // Validação
    if (!post.content || post.content.trim() === '') {
        showToast('Conteúdo é obrigatório');
        return;
    }
    
    const fullPost = {
        id: generateId(),
        date: todayStr(),
        content: post.content,
        user: post.authorId || APP.currentUser.id,
        phaseKey: post.phaseKey || null,
        internal: post.internal !== false
    };
    proj.posts.push(fullPost);
    addHistoryEntry(projectId, 'Publicou mensagem', post.content.substring(0, 50), null);
    persistAll();
    return fullPost;
}

function addPhotoToPhase(projectId, phaseKey, photo) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    if (!phase.photos) phase.photos = [];
    const fullPhoto = {
        id: generateId(),
        filename: photo.filename,
        description: photo.description || photo.filename,
        date: todayStr(),
        uploadedBy: APP.currentUser.id
    };
    phase.photos.push(fullPhoto);
    addHistoryEntry(projectId, 'Adicionou foto', photo.description || photo.filename, phaseKey);
    persistAll();
    return fullPhoto;
}

function addNoteToPhase(projectId, phaseKey, note) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    if (!phase.notes) phase.notes = [];
    const fullNote = {
        id: generateId(),
        text: note.text,
        author: APP.currentUser.id,
        date: todayStr()
    };
    phase.notes.push(fullNote);
    addHistoryEntry(projectId, 'Adicionou nota', note.text.substring(0, 50), phaseKey);
    persistAll();
    return fullNote;
}

function uploadDocumentToDeliverable(projectId, phaseKey, deliverableId, docData) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const del = (phase.deliverables || []).find(d => d.id === deliverableId);
    if (!del) return;
    if (!del.documents) del.documents = [];
    
    // Validação
    if (!docData.filename || docData.filename.trim() === '') {
        showToast('Nome do ficheiro é obrigatório');
        return;
    }

    if (docData.replaceDocId) {
        const existingDoc = del.documents.find(d => d.id === docData.replaceDocId);
        if (existingDoc) {
            const nextVersion = (existingDoc.version || 1) + 1;
            const versionEntry = {
                version: nextVersion,
                filename: docData.filename,
                uploadedBy: APP.currentUser.id,
                uploadedAt: todayStr(),
                size: docData.size || '',
                notes: docData.notes || '',
                changeType: docData.changeType || 'revision', // 'revision', 'correction', 'update'
                previousVersion: existingDoc.version
            };
            
            if (!existingDoc.versions) {
                // Migração de dados antigos se necessário
                existingDoc.versions = [{
                    version: existingDoc.version,
                    filename: existingDoc.filename,
                    uploadedBy: existingDoc.uploadedBy,
                    uploadedAt: existingDoc.uploadedAt,
                    size: existingDoc.size,
                    notes: '',
                    changeType: 'initial',
                    previousVersion: null
                }];
            }
            
            existingDoc.versions.push(versionEntry);
            existingDoc.version = nextVersion;
            existingDoc.filename = docData.filename;
            existingDoc.uploadedAt = todayStr();
            existingDoc.uploadedBy = APP.currentUser.id;
            existingDoc.size = docData.size;
            existingDoc.lastChangeType = docData.changeType || 'revision';
            if (docData.status) existingDoc.status = docData.status;
            
            addHistoryEntry(projectId, 'Nova versão doc', `${docData.filename} (v${nextVersion}) - ${docData.changeType || 'revisão'}`, phaseKey);
            showToast(`Nova versão v${nextVersion} carregada`);
            persistAll();
            return existingDoc;
        }
    }

    // Novo documento
    const newVersion = 1;
    const doc = {
        id: generateId(),
        filename: docData.filename,
        version: newVersion,
        uploadedBy: APP.currentUser.id,
        uploadedAt: todayStr(),
        size: docData.size || '',
        status: docData.status || 'draft',
        lastChangeType: 'initial',
        versions: [{
            version: newVersion,
            filename: docData.filename,
            uploadedBy: APP.currentUser.id,
            uploadedAt: todayStr(),
            size: docData.size || '',
            notes: docData.notes || '',
            changeType: 'initial',
            previousVersion: null
        }]
    };

    del.documents.push(doc);
    addHistoryEntry(projectId, 'Carregou documento', docData.filename, phaseKey);
    persistAll();
    return doc;
}

function revertDocumentVersion(projectId, deliverableId, docId, targetVersion) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return;
    const doc = result.deliverable.documents.find(d => d.id === docId);
    if (!doc || !doc.versions) return;
    
    const targetVersionData = doc.versions.find(v => v.version === targetVersion);
    if (!targetVersionData) return;
    
    const nextVersion = doc.version + 1;
    const revertEntry = {
        version: nextVersion,
        filename: targetVersionData.filename,
        uploadedBy: APP.currentUser.id,
        uploadedAt: todayStr(),
        size: targetVersionData.size,
        notes: `Revertido para v${targetVersion}`,
        changeType: 'revert',
        previousVersion: doc.version,
        revertedFrom: targetVersion
    };
    
    doc.versions.push(revertEntry);
    doc.version = nextVersion;
    doc.filename = targetVersionData.filename;
    doc.uploadedAt = todayStr();
    doc.uploadedBy = APP.currentUser.id;
    doc.size = targetVersionData.size;
    doc.lastChangeType = 'revert';
    
    addHistoryEntry(projectId, 'Reverteu documento', `${doc.filename} para v${targetVersion}`, result.phase.key);
    showToast(`Documento revertido para v${targetVersion}`);
    persistAll();
    handleRoute();
}

function compareDocumentVersions(projectId, deliverableId, docId, version1, version2) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return null;
    const doc = result.deliverable.documents.find(d => d.id === docId);
    if (!doc || !doc.versions) return null;
    
    const v1 = doc.versions.find(v => v.version === version1);
    const v2 = doc.versions.find(v => v.version === version2);
    
    if (!v1 || !v2) return null;
    
    return {
        version1: v1,
        version2: v2,
        differences: {
            filename: v1.filename !== v2.filename,
            size: v1.size !== v2.size,
            uploadedBy: v1.uploadedBy !== v2.uploadedBy,
            changeType: v1.changeType !== v2.changeType
        }
    };
}

function updateDeliverable(projectId, deliverableId, changes) {
    const proj = getProject(projectId);
    if (!proj) return;
    for (const phase of (proj.phases || [])) {
        const del = (phase.deliverables || []).find(d => d.id === deliverableId);
        if (del) {
            Object.assign(del, changes);
            addHistoryEntry(projectId, 'Actualizou entregável', del.name, phase.key);
            persistAll();
            return del;
        }
    }
    return null;
}

function removeDocument(projectId, deliverableId, docId) {
    const res = getDeliverable(projectId, deliverableId);
    if (!res) return false;
    const del = res.deliverable;
    if (!del.documents) return false;
    
    const count = del.documents.length;
    del.documents = del.documents.filter(d => d.id !== docId);
    
    if (del.documents.length < count) {
        addHistoryEntry(projectId, 'Removeu documento', 'ID: ' + docId, res.phase.key);
        persistAll();
        return true;
    }
    return false;
}

function removeDeliverable(projectId, deliverableId) {
    const proj = getProject(projectId);
    if (!proj) return;
    for (const phase of (proj.phases || [])) {
        const idx = (phase.deliverables || []).findIndex(d => d.id === deliverableId);
        if (idx !== -1) {
            const del = phase.deliverables[idx];
            phase.deliverables.splice(idx, 1);
            addHistoryEntry(projectId, 'Removeu entregável', del.name, phase.key);
            persistAll();
            return true;
        }
    }
    return false;
}

function addDeliverableNote(projectId, deliverableId, text) {
    const res = getDeliverable(projectId, deliverableId);
    if (!res) return false;
    const del = res.deliverable;
    if (!del.notes) del.notes = [];
    
    const note = {
        id: generateId(),
        text: text,
        author: APP.currentUser.id,
        date: new Date().toISOString()
    };
    
    del.notes.push(note);
    addHistoryEntry(projectId, 'Adicionou nota ao entregável', del.name, res.phase.key);
    persistAll();
    return note;
}

function removeDeliverableNote(projectId, deliverableId, noteId) {
    const res = getDeliverable(projectId, deliverableId);
    if (!res) return false;
    const del = res.deliverable;
    if (!del.notes) return false;
    
    const count = del.notes.length;
    del.notes = del.notes.filter(n => n.id !== noteId);
    
    if (del.notes.length < count) {
        addHistoryEntry(projectId, 'Removeu nota do entregável', del.name, res.phase.key);
        persistAll();
        return true;
    }
    return false;
}


function removePhase(projectId, phaseKey) {
    const proj = getProject(projectId);
    if (!proj) return;
    const idx = (proj.phases || []).findIndex(ph => ph.key === phaseKey);
    if (idx !== -1) {
        const phase = proj.phases[idx];
        proj.phases.splice(idx, 1);
        addHistoryEntry(projectId, 'Removeu fase', phase.name, phaseKey);
        persistAll();
        return true;
    }
    return false;
}

function addTeamMember(projectId, type, memberId) {
    const proj = getProject(projectId);
    if (!proj) return;
    if (!proj.team) proj.team = { members: [], externals: [], clients: [] };
    const key = type === 'member' ? 'members' : type === 'external' ? 'externals' : 'clients';
    if (!proj.team[key].includes(memberId)) {
        proj.team[key].push(memberId);
        const person = getPersonById(memberId);
        addHistoryEntry(projectId, 'Atribuiu pessoa', person ? person.name : memberId, null);
        persistAll();
    }
    return proj.team;
}

function removeTeamMember(projectId, type, memberId) {
    const proj = getProject(projectId);
    if (!proj) return;
    if (!proj.team) return;
    if (memberId === APP.currentUser.id) return;
    const key = type === 'member' ? 'members' : type === 'external' ? 'externals' : 'clients';
    proj.team[key] = proj.team[key].filter(id => id !== memberId);
    const person = getPersonById(memberId);
    addHistoryEntry(projectId, 'Removeu pessoa', person ? person.name : memberId, null);
    persistAll();
    return proj.team;
}

function updateProjectStatus(projectId, status) {
    const proj = getProject(projectId);
    if (!proj) return;
    proj.status = status;
    addHistoryEntry(projectId, 'Actualizou estado do projecto', status, null);
    persistAll();
    return proj;
}

function updateProjectCurrentPhase(projectId, phaseKey) {
    const proj = getProject(projectId);
    if (!proj) return;
    proj.currentPhaseKey = phaseKey;
    persistAll();
    return proj;
}

function updateVisitStatus(projectId, visitId, status) {
    const proj = getProject(projectId);
    if (!proj) return;
    const visit = (proj.visits || []).find(v => v.id === visitId);
    if (!visit) return;
    visit.status = status;
    addHistoryEntry(projectId, 'Actualizou visita', `Status: ${status}`, null);
    persistAll();
    return visit;
}

function updatePendenciaStatus(projectId, pendenciaId, status) {
    const proj = getProject(projectId);
    if (!proj) return;
    const pend = (proj.pendencias || []).find(p => p.id === pendenciaId);
    if (!pend) return;
    pend.status = status;
    addHistoryEntry(projectId, 'Actualizou pendência', `Status: ${status}`, null);
    persistAll();
    return pend;
}

function updateDocStatus(projectId, deliverableId, docId, newStatus) {
    const result = getDeliverable(projectId, deliverableId);
    if (!result) return;
    const doc = result.deliverable.documents.find(d => d.id === docId);
    if (!doc) return;
    doc.status = newStatus;
    addHistoryEntry(projectId, 'Alterou estado doc', doc.filename + ' → ' + getDocStatusLabel(newStatus), result.phase.key);
    persistAll();
    handleRoute();
}
