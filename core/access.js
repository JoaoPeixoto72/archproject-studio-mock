// ============================================================================
// ArchProject — core/access.js
// Controlo de acesso e visibilidade de dados
// ============================================================================

function canAccess(userRole, visibility) {
    if (!visibility || visibility.length === 0) return userRole === 'admin';
    return visibility.includes(userRole);
}

function canUserSeeDeliverable(userId, deliverable, project) {
    if (APP.currentUser.role === 'admin') return true;
    const role = getUserRoleInProject(userId, project);
    if (!role) return false;
    return canAccess(role, deliverable.visibility);
}

function getUserRoleInProject(userId, project) {
    if (!project || !project.team) return null;
    const member = TEAM.members.find(m => m.id === userId);
    if (member && project.team.members.includes(userId)) {
        return member.role === 'admin' ? 'admin' : 'member';
    }
    if (project.team.externals.includes(userId)) return 'external';
    if (project.team.clients.includes(userId)) return 'client';
    return null;
}
