// ============================================================================
// ArchProject — data/mock.js
// Dados mock estáticos: APP, SETTINGS, TEAM, PHASE_DEFINITIONS, TEMPLATES,
// PROJECTS, TIMER, QUOTES.
// Sem dependências de outros ficheiros.
// ============================================================================

// ============================================================================
// ArchProject - data.js
// Base de dados em memória. Toda a aplicação lê e escreve aqui.
// ============================================================================

const APP = {
    name: 'ArchProject',
    office: {
        name: 'Silva & Associados, Lda.',
        address: 'Rua das Flores, 42 - 4000-150 Porto',
        nif: '514 237 891',
        phone: '+351 222 018 456',
        email: 'geral@silvaassociados.pt',
        logo: null
    },
    currentUser: {
        id: 'u1',
        name: 'Arq. Manuel Silva',
        role: 'admin', // admin | member | external | client
        email: 'manuel@silvaassociados.pt'
    },
    portalMode: null, // null = gabinete, 'client' = portal cliente, 'external' = portal externo
    displayMode: 'simple' // 'simple' | 'full'
};

const SETTINGS = {
    internalRoles: ['Director', 'Sócio', 'Arquitecto', 'Estagiário'],
    externalSpecialties: [
        'Estabilidade', 'Águas e Esgotos', 'AVAC', 'Electricidade', 
        'ITED', 'Gás', 'Acústica', 'Térmica', 'Topografia', 
        'Segurança Incêndio', 'Coordenação de Segurança', 'Fiscalização'
    ],
    rates: {
        defaultHourlyRate: 75,
        weeklyHours: 40,
        roles: {}
    }
};

// ============================================================================
// EQUIPA
// ============================================================================

const TEAM = {
    members: [
        {
            id: 'u1',
            name: 'Arq. Manuel Silva',
            role: 'admin',
            function: 'Director / Arquitecto Principal',
            email: 'manuel@silvaassociados.pt',
            phone: '+351 912 345 678',
            projects: ['p1', 'p2', 'p3']
        },
        {
            id: 'u2',
            name: 'Arq. Ana Rodrigues',
            role: 'member',
            function: 'Arquitecta',
            email: 'ana@silvaassociados.pt',
            phone: '+351 913 456 789',
            projects: ['p1', 'p3']
        },
        {
            id: 'u3',
            name: 'Arq. Pedro Santos',
            role: 'member',
            function: 'Arquitecto Estagiário',
            email: 'pedro@silvaassociados.pt',
            phone: '+351 914 567 890',
            projects: ['p2']
        }
    ],
    externals: [
        {
            id: 'e1',
            name: 'Eng. Carlos Mendes',
            specialty: 'Estabilidade',
            company: 'Mendes Engenharia, Lda.',
            email: 'carlos@mendeseng.pt',
            phone: '+351 915 678 901',
            projects: ['p1', 'p2']
        },
        {
            id: 'e2',
            name: 'Eng. Sofia Almeida',
            specialty: 'Águas e Esgotos / AVAC',
            company: 'HidroClima, Lda.',
            email: 'sofia@hidroclima.pt',
            phone: '+351 916 789 012',
            projects: ['p1', 'p3']
        },
        {
            id: 'e3',
            name: 'Eng. Rui Ferreira',
            specialty: 'Electricidade e Telecomunicações',
            company: 'ElectroRui',
            email: 'rui@electrorui.pt',
            phone: '+351 917 890 123',
            projects: ['p1', 'p2', 'p3']
        },
        {
            id: 'e4',
            name: 'Eng. Teresa Lopes',
            specialty: 'Térmica e Acústica',
            company: 'TermoConfort, Lda.',
            email: 'teresa@termoconfort.pt',
            phone: '+351 918 901 234',
            projects: ['p2']
        },
        {
            id: 'e5',
            name: 'Topógrafo João Martins',
            specialty: 'Topografia',
            company: 'GeoTop',
            email: 'joao@geotop.pt',
            phone: '+351 919 012 345',
            projects: ['p1', 'p2', 'p3']
        }
    ],
    clients: [
        {
            id: 'c1',
            name: 'António Silva',
            email: 'antonio.silva@email.pt',
            phone: '+351 920 123 456',
            project: 'p1'
        },
        {
            id: 'c2',
            name: 'Maria Costa',
            email: 'maria.costa@email.pt',
            phone: '+351 921 234 567',
            project: 'p2'
        },
        {
            id: 'c3',
            name: 'João Ferreira',
            email: 'joao.ferreira@email.pt',
            phone: '+351 922 345 678',
            project: 'p3'
        }
    ]
};

// ============================================================================
// FASES PADRÃO (usadas nos templates e projectos)
// ============================================================================

const PHASE_DEFINITIONS = [
    {
        key: 'pp',
        abbr: 'PP',
        name: 'Programa Preliminar',
        description: 'Definição do programa funcional, objectivos e condicionantes do projecto.',
        order: 1,
        dependencies: [],
        defaultDeliverables: [
            { name: 'Levantamento do existente', description: 'Plantas, cortes e alçados do estado actual (se aplicável).' },
            { name: 'Levantamento topográfico', description: 'Levantamento topográfico do terreno.' },
            { name: 'Programa funcional', description: 'Documento com áreas, usos e relações funcionais pretendidas.' },
            { name: 'Registo fotográfico', description: 'Fotografias do terreno/edifício existente.' },
            { name: 'Condicionantes urbanísticas', description: 'Análise do PDM, regulamentos e servidões aplicáveis.' }
        ],
        defaultApprovals: [
            { type: 'client', name: 'Aprovação do programa pelo cliente' }
        ]
    },
    {
        key: 'ep',
        abbr: 'EP',
        name: 'Estudo Prévio',
        description: 'Primeira proposta volumétrica e espacial, apresentada ao cliente para validação.',
        order: 2,
        dependencies: ['pp'],
        defaultDeliverables: [
            { name: 'Plantas de implantação', description: 'Implantação do edifício no terreno à escala.' },
            { name: 'Plantas dos pisos', description: 'Plantas de todos os pisos com áreas e usos.' },
            { name: 'Cortes esquemáticos', description: 'Cortes longitudinais e transversais.' },
            { name: 'Alçados esquemáticos', description: 'Alçados das fachadas principais.' },
            { name: 'Imagens 3D / Maqueta volumétrica', description: 'Visualização tridimensional da proposta.' },
            { name: 'Memória descritiva', description: 'Descrição sumária da proposta e justificação das opções.' },
            { name: 'Estimativa orçamental', description: 'Estimativa de custo da obra por m².' }
        ],
        defaultApprovals: [
            { type: 'client', name: 'Aprovação da proposta pelo cliente' }
        ]
    },
    {
        key: 'ap',
        abbr: 'AP',
        name: 'Anteprojecto',
        description: 'Desenvolvimento da solução aprovada com maior detalhe técnico.',
        order: 3,
        dependencies: ['ep'],
        defaultDeliverables: [
            { name: 'Plantas detalhadas (1:100)', description: 'Plantas com cotagens, espessuras de parede e nomenclatura.' },
            { name: 'Cortes detalhados (1:100)', description: 'Cortes com alturas, cotas e materiais indicativos.' },
            { name: 'Alçados detalhados (1:100)', description: 'Alçados com materiais e cores.' },
            { name: 'Mapa de acabamentos preliminar', description: 'Lista de acabamentos por compartimento.' },
            { name: 'Memória descritiva e justificativa', description: 'Descrição técnica completa da solução.' }
        ],
        defaultApprovals: [
            { type: 'client', name: 'Aprovação do anteprojecto pelo cliente' },
            { type: 'internal', name: 'Revisão interna do gabinete' }
        ]
    },
    {
        key: 'la',
        abbr: 'LA',
        name: 'Licenciamento - Arquitectura',
        description: 'Preparação e submissão do projecto de arquitectura para licenciamento camarário.',
        order: 4,
        dependencies: ['ap'],
        defaultDeliverables: [
            { name: 'Peças desenhadas para câmara', description: 'Plantas, cortes e alçados conforme regulamento municipal.' },
            { name: 'Memória descritiva regulamentar', description: 'Memória descritiva conforme exigências camarárias.' },
            { name: 'Ficha de elementos estatísticos (INE)', description: 'Formulário INE preenchido.' },
            { name: 'Termos de responsabilidade', description: 'Termos de responsabilidade do arquitecto.' },
            { name: 'Estimativa orçamental (câmara)', description: 'Estimativa para efeitos de taxas camarárias.' },
            { name: 'Calendarização da obra', description: 'Cronograma previsto de execução.' }
        ],
        defaultApprovals: [
            { type: 'council', name: 'Aprovação pela Câmara Municipal' }
        ]
    },
    {
        key: 'le',
        abbr: 'LE',
        name: 'Licenciamento - Especialidades',
        description: 'Coordenação e submissão dos projectos de especialidades.',
        order: 5,
        dependencies: ['la'],
        defaultDeliverables: [
            { name: 'Projecto de estabilidade', description: 'Projecto estrutural completo.' },
            { name: 'Projecto de Águas e esgotos', description: 'Redes de abastecimento e drenagem.' },
            { name: 'Projecto de AVAC', description: 'Aquecimento, ventilação e ar condicionado.' },
            { name: 'Projecto de electricidade', description: 'Instalações eléctricas.' },
            { name: 'Projecto de telecomunicações (ITED)', description: 'Infra-estruturas de telecomunicações.' },
            { name: 'Projecto de gás', description: 'Instalação de gás (se aplicável).' },
            { name: 'Projecto de acústica', description: 'Comportamento acústico do edifício.' },
            { name: 'Projecto de térmica', description: 'Comportamento térmico e energético (SCE/REH).' },
            { name: 'Ficha técnica da habitação', description: 'Ficha técnica conforme legislação.' }
        ],
        defaultApprovals: [
            { type: 'council', name: 'Aprovação das especialidades pela Câmara' },
            { type: 'specialties', name: 'Validação técnica das especialidades' }
        ]
    },
    {
        key: 'pe',
        abbr: 'PE',
        name: 'Projecto de Execução',
        description: 'Detalhamento completo para construção, incluindo pormenores construtivos.',
        order: 6,
        dependencies: ['le'],
        defaultDeliverables: [
            { name: 'Plantas de execução (1:50)', description: 'Plantas completas de obra.' },
            { name: 'Cortes de execução (1:50)', description: 'Cortes construtivos detalhados.' },
            { name: 'Pormenores construtivos (1:20, 1:10, 1:5)', description: 'Detalhes de encontros, remates e elementos especiais.' },
            { name: 'Mapa de acabamentos definitivo', description: 'Lista completa de materiais e acabamentos.' },
            { name: 'Mapa de vãos', description: 'Especificação de portas, janelas e portadas.' },
            { name: 'Mapa de quantidades', description: 'Medições para orçamentação da obra.' },
            { name: 'Caderno de encargos', description: 'Condições técnicas e especiais para a empreitada.' },
            { name: 'Memória descritiva de execução', description: 'Descrição técnica para obra.' }
        ],
        defaultApprovals: [
            { type: 'client', name: 'Aprovação final do projecto de execução' },
            { type: 'internal', name: 'Revisão final do gabinete' }
        ]
    },
    {
        key: 'at',
        abbr: 'AT',
        name: 'Assistência Técnica',
        description: 'Acompanhamento da obra com visitas periódicas e esclarecimento de dúvidas.',
        order: 7,
        dependencies: ['pe'],
        defaultDeliverables: [
            { name: 'Relatórios de visita à obra', description: 'Registo de cada visita com observações e fotos.' },
            { name: 'Esclarecimentos técnicos', description: 'Respostas a dúvidas do empreiteiro.' },
            { name: 'Alterações em obra', description: 'Registo e desenho de alterações durante a construção.' },
            { name: 'Auto de recepção provisória', description: 'Documento de recepção provisória da obra.' }
        ],
        defaultApprovals: [
            { type: 'client', name: 'Aceitação da recepção provisória' }
        ]
    },
    {
        key: 'tf',
        abbr: 'TF',
        name: 'Telas Finais',
        description: 'Desenhos finais conforme construído, para licença de utilização.',
        order: 8,
        dependencies: ['at'],
        defaultDeliverables: [
            { name: 'Telas finais de arquitectura', description: 'Plantas, cortes e alçados conforme construído.' },
            { name: 'Telas finais de especialidades', description: 'Peças desenhadas finais das especialidades.' },
            { name: 'Compilação técnica', description: 'Dossier técnico da obra completo.' },
            { name: 'Requerimento de licença de utilização', description: 'Pedido de licença de utilização.' },
            { name: 'Auto de recepção definitiva', description: 'Recepção definitiva da obra.' }
        ],
        defaultApprovals: [
            { type: 'council', name: 'Emissão da licença de utilização' },
            { type: 'client', name: 'Aceitação final pelo cliente' }
        ]
    }
];

// ============================================================================
// TEMPLATES
// ============================================================================

const TEMPLATES = [
    {
        id: 'tmpl1',
        name: 'Moradia Unifamiliar',
        description: 'Template ideal para construção de raiz ou reconstrução de moradias isoladas ou em banda.',
        createdAt: '2026-01-15',
        updatedAt: '2026-03-10',
        phases: JSON.parse(JSON.stringify(PHASE_DEFINITIONS))
    },
    {
        id: 'tmpl2',
        name: 'Edifício Residencial',
        description: 'Adequado para projectos de habitação colectiva (prédios).',
        createdAt: '2026-02-01',
        updatedAt: '2026-02-15',
        phases: JSON.parse(JSON.stringify(PHASE_DEFINITIONS))
    },
    {
        id: 'tmpl3',
        name: 'Reabilitação Urbana',
        description: 'Focado em edifícios antigos com necessidades de licenciamento em zonas ARU.',
        createdAt: '2026-02-10',
        updatedAt: '2026-03-01',
        phases: JSON.parse(JSON.stringify(PHASE_DEFINITIONS))
    },
    {
        id: 'tmpl4',
        name: 'Espaço Comercial',
        description: 'Para lojas, escritórios, restaurantes e espaços de serviços.',
        createdAt: '2026-02-20',
        updatedAt: '2026-03-05',
        phases: JSON.parse(JSON.stringify(PHASE_DEFINITIONS))
    },
    {
        id: 'tmpl5',
        name: 'Equipamento Público',
        description: 'Para concursos públicos ou projectos de equipamentos colectivos.',
        createdAt: '2026-03-01',
        updatedAt: '2026-03-12',
        phases: JSON.parse(JSON.stringify(PHASE_DEFINITIONS))
    },
    {
        id: 'tmpl6',
        name: 'Turismo e Hotelaria',
        description: 'Destinado a hotéis, turismo rural e alojamento local.',
        createdAt: '2026-03-10',
        updatedAt: '2026-03-20',
        phases: JSON.parse(JSON.stringify(PHASE_DEFINITIONS))
    }
];

// ============================================================================
// PROJECTOS
// ============================================================================

const PROJECTS = [
    {
        id: 'p1',
        name: 'Moradia Silva',
        client: 'c1',
        location: 'Rua do Carmo, 15 - Matosinhos',
        typology: 'Moradia Unifamiliar T4',
        area: 280,
        budget: 85000,
        budgetSpent: 34200,
        status: 'active', // active | completed | archived | on-hold
        currentPhaseKey: 'la',
        templateUsed: 'tmpl1',
        createdAt: '2026-01-20',
        team: {
            members: ['u1', 'u2'],
            externals: ['e1', 'e2', 'e3', 'e5'],
            clients: ['c1']
        },
        phases: [
            {
                key: 'pp',
                abbr: 'PP',
                name: 'Programa Preliminar',
                description: 'Definição do programa funcional, objectivos e condicionantes do projecto.',
                order: 1,
                dependencies: [],
                status: 'done', // done | active | pending | blocked
                startDate: '2026-01-20',
                endDate: '2026-02-05',
                endDateActual: '2026-02-03',
                budgetHours: 24,
                deliverables: [
                    {
                        id: 'd_p1_pp_1',
                        name: 'Levantamento do existente',
                        description: 'Plantas, cortes e alçados do estado actual.',
                        status: 'approved',
                        responsible: 'u2',
                        visibility: ['admin', 'member', 'client'],
                        documents: [
                            {
                                id: 'doc_001',
                                filename: 'Levantamento_Existente_v2.dwg',
                                version: 2,
                                uploadedBy: 'u2',
                                uploadedAt: '2026-01-28',
                                size: '4.2 MB',
                                versions: [
                                    { version: 1, filename: 'Levantamento_Existente_v1.dwg', uploadedBy: 'u2', uploadedAt: '2026-01-25', size: '3.8 MB' },
                                    { version: 2, filename: 'Levantamento_Existente_v2.dwg', uploadedBy: 'u2', uploadedAt: '2026-01-28', size: '4.2 MB' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'd_p1_pp_2',
                        name: 'Levantamento topográfico',
                        description: 'Levantamento topográfico do terreno.',
                        status: 'approved',
                        responsible: 'e5',
                        visibility: ['admin', 'member', 'external', 'client'],
                        documents: [
                            {
                                id: 'doc_002',
                                filename: 'Topografico_Silva.dwg',
                                version: 1,
                                uploadedBy: 'e5',
                                uploadedAt: '2026-01-30',
                                size: '2.1 MB',
                                versions: [
                                    { version: 1, filename: 'Topografico_Silva.dwg', uploadedBy: 'e5', uploadedAt: '2026-01-30', size: '2.1 MB' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'd_p1_pp_3',
                        name: 'Programa funcional',
                        description: 'Documento com áreas, usos e relações funcionais pretendidas.',
                        status: 'approved',
                        responsible: 'u1',
                        visibility: ['admin', 'member', 'client'],
                        documents: [
                            {
                                id: 'doc_003',
                                filename: 'Programa_Funcional_Silva.pdf',
                                version: 1,
                                uploadedBy: 'u1',
                                uploadedAt: '2026-02-01',
                                size: '1.5 MB',
                                versions: [
                                    { version: 1, filename: 'Programa_Funcional_Silva.pdf', uploadedBy: 'u1', uploadedAt: '2026-02-01', size: '1.5 MB' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'd_p1_pp_4',
                        name: 'Registo fotográfico',
                        description: 'Fotografias do terreno.',
                        status: 'approved',
                        responsible: 'u2',
                        visibility: ['admin', 'member', 'client'],
                        documents: []
                    },
                    {
                        id: 'd_p1_pp_5',
                        name: 'Condicionantes urbanísticas',
                        description: 'Análise do PDM, regulamentos e servidões aplicáveis.',
                        status: 'approved',
                        responsible: 'u1',
                        visibility: ['admin', 'member'],
                        documents: [
                            {
                                id: 'doc_004',
                                filename: 'Condicionantes_PDM_Matosinhos.pdf',
                                version: 1,
                                uploadedBy: 'u1',
                                uploadedAt: '2026-01-22',
                                size: '820 KB',
                                versions: [
                                    { version: 1, filename: 'Condicionantes_PDM_Matosinhos.pdf', uploadedBy: 'u1', uploadedAt: '2026-01-22', size: '820 KB' }
                                ]
                            }
                        ]
                    }
                ],
                approvals: [
                    {
                        id: 'apr_p1_pp_1',
                        type: 'client',
                        name: 'Aprovação do programa pelo cliente',
                        status: 'approved',
                        submittedAt: '2026-02-02',
                        respondedAt: '2026-02-03',
                        respondedBy: 'c1',
                        notes: 'Aprovado sem alterações.'
                    }
                ],
                photos: [
                    { id: 'ph_001', filename: 'terreno_frente.jpg', description: 'Vista frontal do terreno', date: '2026-01-21', uploadedBy: 'u2' },
                    { id: 'ph_002', filename: 'terreno_tardoz.jpg', description: 'Vista tardoz', date: '2026-01-21', uploadedBy: 'u2' }
                ],
                notes: [
                    { id: 'n_001', text: 'Terreno com declive de 2m no sentido N-S. Considerar plataformas.', author: 'u1', date: '2026-01-22' },
                    { id: 'n_002', text: 'Cliente pretende garagem para 2 carros e piscina.', author: 'u2', date: '2026-01-23' }
                ]
            },
            {
                key: 'ep',
                abbr: 'EP',
                name: 'Estudo Prévio',
                description: 'Primeira proposta volumétrica e espacial.',
                order: 2,
                dependencies: ['pp'],
                status: 'done',
                startDate: '2026-02-05',
                endDate: '2026-03-01',
                endDateActual: '2026-03-05',
                budgetHours: 40,
                deliverables: [
                    { id: 'd_p1_ep_1', name: 'Plantas de implantação', description: 'Implantação no terreno.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [{ id: 'doc_010', filename: 'Implantacao_EP_v2.dwg', version: 2, uploadedBy: 'u1', uploadedAt: '2026-02-20', size: '3.5 MB', versions: [{ version: 1, filename: 'Implantacao_EP_v1.dwg', uploadedBy: 'u1', uploadedAt: '2026-02-12', size: '3.1 MB' }, { version: 2, filename: 'Implantacao_EP_v2.dwg', uploadedBy: 'u1', uploadedAt: '2026-02-20', size: '3.5 MB' }] }] },
                    { id: 'd_p1_ep_2', name: 'Plantas dos pisos', description: 'Plantas de todos os pisos.', status: 'approved', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [{ id: 'doc_011', filename: 'Plantas_Pisos_EP.dwg', version: 1, uploadedBy: 'u2', uploadedAt: '2026-02-18', size: '5.2 MB', versions: [{ version: 1, filename: 'Plantas_Pisos_EP.dwg', uploadedBy: 'u2', uploadedAt: '2026-02-18', size: '5.2 MB' }] }] },
                    { id: 'd_p1_ep_3', name: 'Cortes esquemáticos', description: 'Cortes longitudinais e transversais.', status: 'approved', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_ep_4', name: 'Alçados esquemáticos', description: 'Alçados das fachadas.', status: 'approved', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_ep_5', name: 'Imagens 3D', description: 'Visualização tridimensional.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [{ id: 'doc_012', filename: '3D_Silva_v1.pdf', version: 1, uploadedBy: 'u1', uploadedAt: '2026-02-25', size: '12.3 MB', versions: [{ version: 1, filename: '3D_Silva_v1.pdf', uploadedBy: 'u1', uploadedAt: '2026-02-25', size: '12.3 MB' }] }] },
                    { id: 'd_p1_ep_6', name: 'Memória descritiva', description: 'Descrição sumária da proposta.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_ep_7', name: 'Estimativa orçamental', description: 'Estimativa de custo.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p1_ep_1', type: 'client', name: 'Aprovação da proposta pelo cliente', status: 'approved', submittedAt: '2026-02-28', respondedAt: '2026-03-05', respondedBy: 'c1', notes: 'Aprovado com pedido de alteração na cozinha - open space com sala.' }
                ],
                photos: [],
                notes: [
                    { id: 'n_010', text: 'Cliente aprovou conceito geral mas pediu cozinha open space.', author: 'u1', date: '2026-03-05' }
                ]
            },
            {
                key: 'ap',
                abbr: 'AP',
                name: 'Anteprojecto',
                description: 'Desenvolvimento da solução aprovada com maior detalhe.',
                order: 3,
                dependencies: ['ep'],
                status: 'done',
                startDate: '2026-03-06',
                endDate: '2026-04-05',
                endDateActual: '2026-04-02',
                budgetHours: 60,
                deliverables: [
                    { id: 'd_p1_ap_1', name: 'Plantas detalhadas (1:100)', description: 'Plantas com cotagens.', status: 'approved', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [{ id: 'doc_020', filename: 'Plantas_AP_v1.dwg', version: 1, uploadedBy: 'u2', uploadedAt: '2026-03-25', size: '6.1 MB', versions: [{ version: 1, filename: 'Plantas_AP_v1.dwg', uploadedBy: 'u2', uploadedAt: '2026-03-25', size: '6.1 MB' }] }] },
                    { id: 'd_p1_ap_2', name: 'Cortes detalhados (1:100)', description: 'Cortes com alturas e cotas.', status: 'approved', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_ap_3', name: 'Alçados detalhados (1:100)', description: 'Alçados com materiais.', status: 'approved', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_ap_4', name: 'Mapa de acabamentos preliminar', description: 'Acabamentos por compartimento.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_ap_5', name: 'Memória descritiva e justificativa', description: 'Descrição técnica.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p1_ap_1', type: 'client', name: 'Aprovação do anteprojecto pelo cliente', status: 'approved', submittedAt: '2026-03-30', respondedAt: '2026-04-02', respondedBy: 'c1', notes: '' },
                    { id: 'apr_p1_ap_2', type: 'internal', name: 'Revisão interna do gabinete', status: 'approved', submittedAt: '2026-03-28', respondedAt: '2026-03-29', respondedBy: 'u1', notes: 'OK. Avançar para licenciamento.' }
                ],
                photos: [],
                notes: []
            },
            {
                key: 'la',
                abbr: 'LA',
                name: 'Licenciamento - Arquitectura',
                description: 'Submissão do projecto de arquitectura para licenciamento camarário.',
                order: 4,
                dependencies: ['ap'],
                status: 'active',
                startDate: '2026-04-03',
                endDate: '2026-05-15',
                endDateActual: null,
                budgetHours: 35,
                deliverables: [
                    { id: 'd_p1_la_1', name: 'Peças desenhadas para câmara', description: 'Plantas, cortes e alçados regulamentares.', status: 'done', responsible: 'u2', visibility: ['admin', 'member'], documents: [{ id: 'doc_030', filename: 'Pecas_Desenhadas_Camara_v1.dwg', version: 1, uploadedBy: 'u2', uploadedAt: '2026-04-15', size: '8.4 MB', versions: [{ version: 1, filename: 'Pecas_Desenhadas_Camara_v1.dwg', uploadedBy: 'u2', uploadedAt: '2026-04-15', size: '8.4 MB' }] }] },
                    { id: 'd_p1_la_2', name: 'Memória descritiva regulamentar', description: 'Memória conforme exigências camarárias.', status: 'done', responsible: 'u1', visibility: ['admin', 'member'], documents: [{ id: 'doc_031', filename: 'Memoria_Descritiva_LA.pdf', version: 1, uploadedBy: 'u1', uploadedAt: '2026-04-18', size: '2.3 MB', versions: [{ version: 1, filename: 'Memoria_Descritiva_LA.pdf', uploadedBy: 'u1', uploadedAt: '2026-04-18', size: '2.3 MB' }] }] },
                    { id: 'd_p1_la_3', name: 'Ficha INE', description: 'Formulário INE preenchido.', status: 'in-progress', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_la_4', name: 'Termos de responsabilidade', description: 'Termos do arquitecto.', status: 'in-progress', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_la_5', name: 'Estimativa orçamental (câmara)', description: 'Estimativa para taxas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_la_6', name: 'Calendarização da obra', description: 'Cronograma de execução.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p1_la_1', type: 'council', name: 'Aprovação pela Câmara Municipal', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [],
                notes: [
                    { id: 'n_020', text: 'Falta completar ficha INE e termos de responsabilidade antes de submeter.', author: 'u1', date: '2026-04-20' }
                ]
            },
            {
                key: 'le',
                abbr: 'LE',
                name: 'Licenciamento - Especialidades',
                description: 'Coordenação e submissão dos projectos de especialidades.',
                order: 5,
                dependencies: ['la'],
                status: 'pending',
                startDate: null,
                endDate: null,
                endDateActual: null,
                deliverables: [
                    { id: 'd_p1_le_1', name: 'Projecto de estabilidade', description: 'Projecto estrutural.', status: 'pending', responsible: 'e1', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_2', name: 'Projecto de Águas e esgotos', description: 'Redes de abastecimento e drenagem.', status: 'pending', responsible: 'e2', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_3', name: 'Projecto de AVAC', description: 'Aquecimento, ventilação e AC.', status: 'pending', responsible: 'e2', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_4', name: 'Projecto de electricidade', description: 'Instalações eléctricas.', status: 'pending', responsible: 'e3', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_5', name: 'Projecto de telecomunicações (ITED)', description: 'Infra-estruturas ITED.', status: 'pending', responsible: 'e3', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_6', name: 'Projecto de gás', description: 'Instalação de gás.', status: 'pending', responsible: 'e2', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_7', name: 'Projecto de acústica', description: 'Comportamento acústico.', status: 'pending', responsible: null, visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_8', name: 'Projecto de térmica', description: 'Comportamento térmico (SCE/REH).', status: 'pending', responsible: null, visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_le_9', name: 'Ficha técnica da habitação', description: 'Ficha técnica.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p1_le_1', type: 'council', name: 'Aprovação das especialidades pela Câmara', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' },
                    { id: 'apr_p1_le_2', type: 'specialties', name: 'Validação técnica das especialidades', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [],
                notes: []
            },
            {
                key: 'pe',
                abbr: 'PE',
                name: 'Projecto de Execução',
                description: 'Detalhamento completo para construção.',
                order: 6,
                dependencies: ['le'],
                status: 'pending',
                startDate: null,
                endDate: null,
                endDateActual: null,
                deliverables: [
                    { id: 'd_p1_pe_1', name: 'Plantas de execução (1:50)', description: 'Plantas completas de obra.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_pe_2', name: 'Cortes de execução (1:50)', description: 'Cortes construtivos detalhados.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_pe_3', name: 'Pormenores construtivos', description: 'Detalhes de encontros e remates.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_pe_4', name: 'Mapa de acabamentos definitivo', description: 'Lista completa de materiais.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_pe_5', name: 'Mapa de vãos', description: 'Portas, janelas e portadas.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_pe_6', name: 'Mapa de quantidades', description: 'Medições para orçamentação.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_pe_7', name: 'Caderno de encargos', description: 'Condições técnicas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_pe_8', name: 'Memória descritiva de execução', description: 'Descrição técnica para obra.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p1_pe_1', type: 'client', name: 'Aprovação final do projecto de execução', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' },
                    { id: 'apr_p1_pe_2', type: 'internal', name: 'Revisão final do gabinete', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [],
                notes: []
            },
            {
                key: 'at',
                abbr: 'AT',
                name: 'Assistência Técnica',
                description: 'Acompanhamento da obra.',
                order: 7,
                dependencies: ['pe'],
                status: 'pending',
                startDate: null,
                endDate: null,
                endDateActual: null,
                deliverables: [
                    { id: 'd_p1_at_1', name: 'Relatórios de visita à obra', description: 'Registo de cada visita.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p1_at_2', name: 'Esclarecimentos técnicos', description: 'Respostas a dúvidas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_at_3', name: 'Alterações em obra', description: 'Registo de alterações.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_at_4', name: 'Auto de recepção provisória', description: 'Recepção provisória.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p1_at_1', type: 'client', name: 'Aceitação da recepção provisória', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [],
                notes: []
            },
            {
                key: 'tf',
                abbr: 'TF',
                name: 'Telas Finais',
                description: 'Desenhos finais conforme construído.',
                order: 8,
                dependencies: ['at'],
                status: 'pending',
                startDate: null,
                endDate: null,
                endDateActual: null,
                deliverables: [
                    { id: 'd_p1_tf_1', name: 'Telas finais de arquitectura', description: 'Conforme construído.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_tf_2', name: 'Telas finais de especialidades', description: 'Peças finais.', status: 'pending', responsible: null, visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p1_tf_3', name: 'Compilação técnica', description: 'Dossier técnico.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_tf_4', name: 'Requerimento licença de utilização', description: 'Pedido de licença.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p1_tf_5', name: 'Auto de recepção definitiva', description: 'Recepção definitiva.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p1_tf_1', type: 'council', name: 'Emissão da licença de utilização', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' },
                    { id: 'apr_p1_tf_2', type: 'client', name: 'Aceitação final pelo cliente', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [],
                notes: []
            }
        ],
        visits: [
            {
                id: 'v_p1_1',
                date: '2026-01-21',
                participants: ['u1', 'u2'],
                notes: 'Visita ao terreno para levantamento fotográfico e reconhecimento.',
                photos: [
                    { id: 'ph_v_1', filename: 'terreno_frente.jpg', date: '2026-01-21', uploadedBy: 'u2' },
                    { id: 'ph_v_2', filename: 'terreno_tardoz.jpg', date: '2026-01-21', uploadedBy: 'u2' }
                ],
                actions: [
                    { id: 'va_001', description: 'Pedir levantamento topográfico ao Eng. João Martins', status: 'done', responsible: 'u1' }
                ]
            }
        ],
        timeLogs: [
            { id: 'tl_001', date: '2026-01-20', hours: 2.0, phase: 'pp', description: 'Reunião inicial com cliente', user: 'u1', billable: true },
            { id: 'tl_002', date: '2026-01-21', hours: 3.5, phase: 'pp', description: 'Visita ao terreno e levantamento fotográfico', user: 'u2', billable: true },
            { id: 'tl_003', date: '2026-01-22', hours: 1.5, phase: 'pp', description: 'Análise do PDM', user: 'u1', billable: true },
            { id: 'tl_004', date: '2026-01-28', hours: 4.0, phase: 'pp', description: 'Levantamento do existente - desenho', user: 'u2', billable: true },
            { id: 'tl_005', date: '2026-02-01', hours: 3.0, phase: 'pp', description: 'Programa funcional - redacção', user: 'u1', billable: true },
            { id: 'tl_006', date: '2026-02-10', hours: 6.0, phase: 'ep', description: 'Estudo prévio - plantas e implantação', user: 'u1', billable: true },
            { id: 'tl_007', date: '2026-02-15', hours: 8.0, phase: 'ep', description: 'Estudo prévio - modelação 3D', user: 'u1', billable: true },
            { id: 'tl_008', date: '2026-02-18', hours: 5.0, phase: 'ep', description: 'Plantas dos pisos', user: 'u2', billable: true },
            { id: 'tl_009', date: '2026-03-10', hours: 6.0, phase: 'ap', description: 'Anteprojecto - plantas detalhadas', user: 'u2', billable: true },
            { id: 'tl_010', date: '2026-03-20', hours: 4.0, phase: 'ap', description: 'Memória descritiva AP', user: 'u1', billable: true },
            { id: 'tl_011', date: '2026-04-10', hours: 5.0, phase: 'la', description: 'Peças desenhadas para câmara', user: 'u2', billable: true },
            { id: 'tl_012', date: '2026-04-18', hours: 3.0, phase: 'la', description: 'Memória descritiva regulamentar', user: 'u1', billable: true },
            { id: 'tl_013', date: '2026-04-05', hours: 1.0, phase: 'la', description: 'Reunião administrativa (não facturável)', user: 'u1', billable: false }
        ],
        pendencias: [
            { id: 'pend_p1_1', description: 'Completar Ficha INE', priority: 'high', responsible: 'u2', deadline: '2026-05-01', status: 'open', phase: 'la', createdAt: '2026-04-20' },
            { id: 'pend_p1_2', description: 'Assinar termos de responsabilidade', priority: 'high', responsible: 'u1', deadline: '2026-05-01', status: 'open', phase: 'la', createdAt: '2026-04-20' },
            { id: 'pend_p1_3', description: 'Preparar estimativa orçamental para câmara', priority: 'medium', responsible: 'u1', deadline: '2026-05-10', status: 'open', phase: 'la', createdAt: '2026-04-20' },
            { id: 'pend_p1_4', description: 'Solicitar projecto de estabilidade ao Eng. Carlos', priority: 'low', responsible: 'u1', deadline: '2026-06-01', status: 'open', phase: 'le', createdAt: '2026-04-22' }
        ],
        posts: [],
        history: [
            { date: '2026-04-18', user: 'u1', action: 'Carregou documento', detail: 'Memoria_Descritiva_LA.pdf na fase Licenciamento - Arquitectura', phase: 'la' },
            { date: '2026-04-15', user: 'u2', action: 'Carregou documento', detail: 'Pecas_Desenhadas_Camara_v1.dwg na fase Licenciamento - Arquitectura', phase: 'la' },
            { date: '2026-04-03', user: 'u1', action: 'Iniciou fase', detail: 'Licenciamento - Arquitectura', phase: 'la' },
            { date: '2026-04-02', user: 'c1', action: 'Aprovou', detail: 'Anteprojecto aprovado pelo cliente', phase: 'ap' },
            { date: '2026-03-29', user: 'u1', action: 'Aprovou', detail: 'Revisão interna do anteprojecto', phase: 'ap' },
            { date: '2026-03-05', user: 'c1', action: 'Aprovou', detail: 'Estudo prévio aprovado pelo cliente', phase: 'ep' },
            { date: '2026-02-03', user: 'c1', action: 'Aprovou', detail: 'Programa preliminar aprovado pelo cliente', phase: 'pp' },
            { date: '2026-01-20', user: 'u1', action: 'Criou projecto', detail: 'Moradia Silva criado a partir do template Moradia Unifamiliar', phase: null }
        ]
    },

    // ========================================================================
    // PROJECTO 2 - Moradia Costa
    // ========================================================================
    {
        id: 'p2',
        name: 'Moradia Costa',
        client: 'c2',
        location: 'Av. da Boavista, 1230 - Porto',
        typology: 'Moradia Unifamiliar T3',
        area: 210,
        budget: 65000,
        budgetSpent: 18500,
        status: 'active',
        currentPhaseKey: 'ep',
        templateUsed: 'tmpl1',
        createdAt: '2026-03-01',
        team: {
            members: ['u1', 'u3'],
            externals: ['e1', 'e3', 'e4', 'e5'],
            clients: ['c2']
        },
        phases: [
            {
                key: 'pp', abbr: 'PP', name: 'Programa Preliminar', description: 'Definição do programa funcional.', order: 1, dependencies: [], status: 'done',
                startDate: '2026-03-01', endDate: '2026-03-15', endDateActual: '2026-03-14',
                deliverables: [
{ id: 'd_p2_pp_1', name: 'Levantamento do existente', description: 'Terreno vazio - não aplicável.', status: 'approved', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_pp_2', name: 'Levantamento topográfico', description: 'Levantamento topográfico do terreno.', status: 'approved', responsible: 'e5', visibility: ['admin', 'member', 'external', 'client'], documents: [{ id: 'doc_100', filename: 'Topografico_Costa.dwg', version: 1, uploadedBy: 'e5', uploadedAt: '2026-03-08', size: '1.9 MB', versions: [{ version: 1, filename: 'Topografico_Costa.dwg', uploadedBy: 'e5', uploadedAt: '2026-03-08', size: '1.9 MB' }] }] },
                    { id: 'd_p2_pp_3', name: 'Programa funcional', description: 'áreas e usos pretendidos.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [{ id: 'doc_101', filename: 'Programa_Costa.pdf', version: 1, uploadedBy: 'u1', uploadedAt: '2026-03-10', size: '980 KB', versions: [{ version: 1, filename: 'Programa_Costa.pdf', uploadedBy: 'u1', uploadedAt: '2026-03-10', size: '980 KB' }] }] },
                    { id: 'd_p2_pp_4', name: 'Registo fotográfico', description: 'Fotografias do terreno.', status: 'approved', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_pp_5', name: 'Condicionantes urbanísticas', description: 'Análise do PDM e regulamentos.', status: 'approved', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p2_pp_1', type: 'client', name: 'Aprovação do programa pelo cliente', status: 'approved', submittedAt: '2026-03-13', respondedAt: '2026-03-14', respondedBy: 'c2', notes: 'OK.' }
                ],
                photos: [
                    { id: 'ph_100', filename: 'terreno_costa_1.jpg', description: 'Vista geral do terreno', date: '2026-03-02', uploadedBy: 'u3' }
                ],
                notes: [
                    { id: 'n_100', text: 'Terreno plano, orientação Sul favorável. Cliente pretende T3 com escritório.', author: 'u1', date: '2026-03-02' }
                ]
            },
            {
                key: 'ep', abbr: 'EP', name: 'Estudo Prévio', description: 'Primeira proposta volumétrica.', order: 2, dependencies: ['pp'], status: 'active',
                startDate: '2026-03-15', endDate: '2026-04-15', endDateActual: null,
                deliverables: [
                    { id: 'd_p2_ep_1', name: 'Plantas de implantação', description: 'Implantação no terreno.', status: 'done', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [{ id: 'doc_110', filename: 'Implantacao_Costa_EP.dwg', version: 1, uploadedBy: 'u3', uploadedAt: '2026-03-28', size: '2.8 MB', versions: [{ version: 1, filename: 'Implantacao_Costa_EP.dwg', uploadedBy: 'u3', uploadedAt: '2026-03-28', size: '2.8 MB' }] }] },
                    { id: 'd_p2_ep_2', name: 'Plantas dos pisos', description: 'Plantas de todos os pisos.', status: 'in-progress', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ep_3', name: 'Cortes esquemáticos', description: 'Cortes longitudinais e transversais.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ep_4', name: 'Alçados esquemáticos', description: 'Alçados das fachadas.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ep_5', name: 'Imagens 3D', description: 'Visualização 3D.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ep_6', name: 'Memória descritiva', description: 'Descrição da proposta.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ep_7', name: 'Estimativa orçamental', description: 'Estimativa de custo.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p2_ep_1', type: 'client', name: 'Aprovação da proposta pelo cliente', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [],
                notes: [
                    { id: 'n_110', text: 'Proposta com 2 pisos, piso 0 social e piso 1 privado. Escritório no piso 0.', author: 'u1', date: '2026-03-20' }
                ]
            },
            {
                key: 'ap', abbr: 'AP', name: 'Anteprojecto', description: 'Desenvolvimento da solução.', order: 3, dependencies: ['ep'], status: 'pending',
                startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p2_ap_1', name: 'Plantas detalhadas (1:100)', description: 'Plantas com cotagens.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ap_2', name: 'Cortes detalhados (1:100)', description: 'Cortes com alturas.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ap_3', name: 'Alçados detalhados (1:100)', description: 'Alçados com materiais.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ap_4', name: 'Mapa de acabamentos preliminar', description: 'Acabamentos por compartimento.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_ap_5', name: 'Memória descritiva e justificativa', description: 'Descrição técnica.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p2_ap_1', type: 'client', name: 'Aprovação do anteprojecto pelo cliente', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' },
                    { id: 'apr_p2_ap_2', type: 'internal', name: 'Revisão interna do gabinete', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [], notes: []
            },
            {
                key: 'la', abbr: 'LA', name: 'Licenciamento - Arquitectura', description: 'Submissão para licenciamento.', order: 4, dependencies: ['ap'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p2_la_1', name: 'Peças desenhadas para câmara', description: 'Regulamentares.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_la_2', name: 'Memória descritiva regulamentar', description: 'Conforme exigências.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_la_3', name: 'Ficha INE', description: 'Formulário INE.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_la_4', name: 'Termos de responsabilidade', description: 'Termos do arquitecto.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_la_5', name: 'Estimativa orçamental (câmara)', description: 'Para taxas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_la_6', name: 'Calendarização da obra', description: 'Cronograma.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [{ id: 'apr_p2_la_1', type: 'council', name: 'Aprovação pela Câmara Municipal', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }],
                photos: [], notes: []
            },
            {
                key: 'le', abbr: 'LE', name: 'Licenciamento - Especialidades', description: 'Especialidades.', order: 5, dependencies: ['la'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p2_le_1', name: 'Projecto de estabilidade', description: 'Estrutural.', status: 'pending', responsible: 'e1', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p2_le_2', name: 'Projecto de electricidade', description: 'Eléctricas.', status: 'pending', responsible: 'e3', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p2_le_3', name: 'Projecto de térmica', description: 'SCE/REH.', status: 'pending', responsible: 'e4', visibility: ['admin', 'member', 'external'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p2_le_1', type: 'council', name: 'Aprovação das especialidades pela Câmara', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [], notes: []
            },
            {
                key: 'pe', abbr: 'PE', name: 'Projecto de Execução', description: 'Detalhamento para construção.', order: 6, dependencies: ['le'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p2_pe_1', name: 'Plantas de execução (1:50)', description: 'Plantas de obra.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_pe_2', name: 'Pormenores construtivos', description: 'Detalhes.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_pe_3', name: 'Mapa de quantidades', description: 'Medições.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_pe_4', name: 'Caderno de encargos', description: 'Condições técnicas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p2_pe_1', type: 'client', name: 'Aprovação final', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [], notes: []
            },
            {
                key: 'at', abbr: 'AT', name: 'Assistência Técnica', description: 'Acompanhamento da obra.', order: 7, dependencies: ['pe'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p2_at_1', name: 'Relatórios de visita à obra', description: 'Registo de visitas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p2_at_2', name: 'Auto de recepção provisória', description: 'Recepção provisória.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] }
                ],
                approvals: [{ id: 'apr_p2_at_1', type: 'client', name: 'Aceitação da recepção provisória', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }],
                photos: [], notes: []
            },
            {
                key: 'tf', abbr: 'TF', name: 'Telas Finais', description: 'Desenhos finais.', order: 8, dependencies: ['at'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p2_tf_1', name: 'Telas finais de arquitectura', description: 'Conforme construído.', status: 'pending', responsible: 'u3', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p2_tf_2', name: 'Compilação técnica', description: 'Dossier técnico.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p2_tf_1', type: 'council', name: 'Emissão da licença de utilização', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [], notes: []
            }
        ],
        visits: [
            {
                id: 'v1',
                date: '2026-03-15',
                participants: ['u1', 'e1'],
                notes: 'Visita inicial para levantamento de cotas e verificação de acessos. A estrutura principal parece em bom estado, mas requer reforço na ala norte.',
                photos: [1, 2],
                actions: [
                    { id: 'a1', description: 'Confirmar cotas do vão da sala', status: 'done', responsible: 'u1' },
                    { id: 'a2', description: 'Solicitar orçamento de reforço estrutural', status: 'open', responsible: 'e1' }
                ]
            },
            {
                id: 'v2',
                date: '2026-04-02',
                participants: ['u1', 'u2', 'c1'],
                notes: 'Reunião de obra com o cliente para validação de acabamentos. Foram escolhidos os materiais para o pavimento da cozinha.',
                photos: [1],
                actions: [
                    { id: 'a3', description: 'Enviar amostras de cerâmico para aprovação final', status: 'open', responsible: 'u1' }
                ]
            }
        ],
        timeLogs: [
            { id: 'tl_100', date: '2026-03-01', hours: 1.5, phase: 'pp', description: 'Reunião inicial com cliente Costa', user: 'u1', billable: true },
            { id: 'tl_101', date: '2026-03-02', hours: 2.0, phase: 'pp', description: 'Visita ao terreno', user: 'u3', billable: true },
            { id: 'tl_102', date: '2026-03-10', hours: 2.0, phase: 'pp', description: 'Programa funcional', user: 'u1', billable: true },
            { id: 'tl_103', date: '2026-03-20', hours: 4.0, phase: 'ep', description: 'Implantação e volumetria', user: 'u3', billable: true },
            { id: 'tl_104', date: '2026-03-28', hours: 5.0, phase: 'ep', description: 'Plantas de implantação', user: 'u3', billable: true },
            { id: 'tl_105', date: '2026-04-02', hours: 4.0, phase: 'ep', description: 'Plantas dos pisos (em curso)', user: 'u3', billable: true }
        ],
        pendencias: [
            { id: 'pend_p2_1', description: 'Concluir plantas dos pisos do estudo prévio', priority: 'high', responsible: 'u3', deadline: '2026-04-10', status: 'open', phase: 'ep', createdAt: '2026-04-01' },
            { id: 'pend_p2_2', description: 'Preparar cortes e alçados esquemáticos', priority: 'medium', responsible: 'u3', deadline: '2026-04-12', status: 'open', phase: 'ep', createdAt: '2026-04-01' },
            { id: 'pend_p2_3', description: 'Modelação 3D para apresentação ao cliente', priority: 'medium', responsible: 'u1', deadline: '2026-04-15', status: 'open', phase: 'ep', createdAt: '2026-04-05' }
        ],
        posts: [],
        history: [
            { date: '2026-03-28', user: 'u3', action: 'Carregou documento', detail: 'Implantacao_Costa_EP.dwg no Estudo Prévio', phase: 'ep' },
            { date: '2026-03-14', user: 'c2', action: 'Aprovou', detail: 'Programa preliminar aprovado pelo cliente', phase: 'pp' },
            { date: '2026-03-01', user: 'u1', action: 'Criou projecto', detail: 'Moradia Costa criado a partir do template Moradia Unifamiliar', phase: null }
        ]
    },

    // ========================================================================
    // PROJECTO 3 - Moradia Ferreira
    // ========================================================================
    {
        id: 'p3',
        name: 'Moradia Ferreira',
        client: 'c3',
        location: 'Rua de Santa Catarina, 87 - Vila Nova de Gaia',
        typology: 'Moradia Unifamiliar T4+1',
        area: 350,
        budget: 110000,
        budgetSpent: 8200,
        status: 'active',
        currentPhaseKey: 'pp',
        templateUsed: 'tmpl1',
        createdAt: '2026-04-01',
        team: {
            members: ['u1', 'u2'],
            externals: ['e2', 'e3', 'e5'],
            clients: ['c3']
        },
        phases: [
            {
                key: 'pp', abbr: 'PP', name: 'Programa Preliminar', description: 'Definição do programa funcional.', order: 1, dependencies: [], status: 'active',
                startDate: '2026-04-01', endDate: '2026-04-20', endDateActual: null,
                deliverables: [
                    { id: 'd_p3_pp_1', name: 'Levantamento do existente', description: 'Edifício existente a demolir parcialmente.', status: 'done', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [{ id: 'doc_200', filename: 'Levantamento_Ferreira_v1.dwg', version: 1, uploadedBy: 'u2', uploadedAt: '2026-04-05', size: '3.9 MB', versions: [{ version: 1, filename: 'Levantamento_Ferreira_v1.dwg', uploadedBy: 'u2', uploadedAt: '2026-04-05', size: '3.9 MB' }] }] },
                    { id: 'd_p3_pp_2', name: 'Levantamento topográfico', description: 'Levantamento do terreno.', status: 'in-progress', responsible: 'e5', visibility: ['admin', 'member', 'external', 'client'], documents: [] },
                    { id: 'd_p3_pp_3', name: 'Programa funcional', description: 'áreas e usos.', status: 'in-progress', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_pp_4', name: 'Registo fotográfico', description: 'Fotografias do local.', status: 'done', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_pp_5', name: 'Condicionantes urbanísticas', description: 'Análise do PDM de Gaia.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p3_pp_1', type: 'client', name: 'Aprovação do programa pelo cliente', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [
                    { id: 'ph_200', filename: 'ferreira_fachada.jpg', description: 'Fachada principal do edifício existente', date: '2026-04-02', uploadedBy: 'u2' },
                    { id: 'ph_201', filename: 'ferreira_interior.jpg', description: 'Interior - estado actual', date: '2026-04-02', uploadedBy: 'u2' },
                    { id: 'ph_202', filename: 'ferreira_quintal.jpg', description: 'Quintal/logradouro', date: '2026-04-02', uploadedBy: 'u2' }
                ],
                notes: [
                    { id: 'n_200', text: 'Edifício existente em mau estado. Cliente pretende demolição parcial e reconstrução.', author: 'u1', date: '2026-04-01' },
                    { id: 'n_201', text: 'Verificar se está em zona de protecção ARU de Gaia.', author: 'u2', date: '2026-04-03' },
                    { id: 'n_202', text: 'Cliente quer suite no último piso com terraço. Orçamento mais elevado.', author: 'u1', date: '2026-04-05' }
                ]
            },
            {
                key: 'ep', abbr: 'EP', name: 'Estudo Prévio', description: 'Primeira proposta.', order: 2, dependencies: ['pp'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p3_ep_1', name: 'Plantas de implantação', description: 'Implantação.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ep_2', name: 'Plantas dos pisos', description: 'Todos os pisos.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ep_3', name: 'Cortes esquemáticos', description: 'Cortes.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ep_4', name: 'Alçados esquemáticos', description: 'Alçados.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ep_5', name: 'Imagens 3D', description: '3D.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ep_6', name: 'Memória descritiva', description: 'Descrição.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ep_7', name: 'Estimativa orçamental', description: 'Custos.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] }
                ],
                approvals: [{ id: 'apr_p3_ep_1', type: 'client', name: 'Aprovação da proposta pelo cliente', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }],
                photos: [], notes: []
            },
            {
                key: 'ap', abbr: 'AP', name: 'Anteprojecto', description: 'Desenvolvimento.', order: 3, dependencies: ['ep'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p3_ap_1', name: 'Plantas detalhadas (1:100)', description: 'Cotagens.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ap_2', name: 'Cortes detalhados (1:100)', description: 'Alturas.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ap_3', name: 'Alçados detalhados (1:100)', description: 'Materiais.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ap_4', name: 'Mapa de acabamentos', description: 'Acabamentos.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_ap_5', name: 'Memória descritiva', description: 'Técnica.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p3_ap_1', type: 'client', name: 'Aprovação do anteprojecto', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' },
                    { id: 'apr_p3_ap_2', type: 'internal', name: 'Revisão interna', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [], notes: []
            },
            {
                key: 'la', abbr: 'LA', name: 'Licenciamento - Arquitectura', description: 'Licenciamento.', order: 4, dependencies: ['ap'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p3_la_1', name: 'Peças desenhadas para câmara', description: 'Regulamentares.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_la_2', name: 'Memória descritiva regulamentar', description: 'Exigências.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_la_3', name: 'Ficha INE', description: 'INE.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_la_4', name: 'Termos de responsabilidade', description: 'Termos.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_la_5', name: 'Estimativa orçamental (câmara)', description: 'Taxas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_la_6', name: 'Calendarização da obra', description: 'Cronograma.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [{ id: 'apr_p3_la_1', type: 'council', name: 'Aprovação pela Câmara Municipal', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }],
                photos: [], notes: []
            },
            {
                key: 'le', abbr: 'LE', name: 'Licenciamento - Especialidades', description: 'Especialidades.', order: 5, dependencies: ['la'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p3_le_1', name: 'Projecto de Águas e esgotos', description: 'Redes.', status: 'pending', responsible: 'e2', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p3_le_2', name: 'Projecto de electricidade', description: 'Eléctricas.', status: 'pending', responsible: 'e3', visibility: ['admin', 'member', 'external'], documents: [] },
                    { id: 'd_p3_le_3', name: 'Projecto de AVAC', description: 'AVAC.', status: 'pending', responsible: 'e2', visibility: ['admin', 'member', 'external'], documents: [] }
                ],
                approvals: [{ id: 'apr_p3_le_1', type: 'council', name: 'Aprovação das especialidades', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }],
                photos: [], notes: []
            },
            {
                key: 'pe', abbr: 'PE', name: 'Projecto de Execução', description: 'Execução.', order: 6, dependencies: ['le'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p3_pe_1', name: 'Plantas de execução (1:50)', description: 'Obra.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_pe_2', name: 'Pormenores construtivos', description: 'Detalhes.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_pe_3', name: 'Mapa de quantidades', description: 'Medições.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [{ id: 'apr_p3_pe_1', type: 'client', name: 'Aprovação final', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }],
                photos: [], notes: []
            },
            {
                key: 'at', abbr: 'AT', name: 'Assistência Técnica', description: 'Obra.', order: 7, dependencies: ['pe'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p3_at_1', name: 'Relatórios de visita', description: 'Visitas.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] },
                    { id: 'd_p3_at_2', name: 'Auto de recepção provisória', description: 'Recepção.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member', 'client'], documents: [] }
                ],
                approvals: [{ id: 'apr_p3_at_1', type: 'client', name: 'Aceitação provisória', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }],
                photos: [], notes: []
            },
            {
                key: 'tf', abbr: 'TF', name: 'Telas Finais', description: 'Finais.', order: 8, dependencies: ['at'], status: 'pending', startDate: null, endDate: null, endDateActual: null,
                deliverables: [
                    { id: 'd_p3_tf_1', name: 'Telas finais de arquitectura', description: 'Construído.', status: 'pending', responsible: 'u2', visibility: ['admin', 'member'], documents: [] },
                    { id: 'd_p3_tf_2', name: 'Compilação técnica', description: 'Dossier.', status: 'pending', responsible: 'u1', visibility: ['admin', 'member'], documents: [] }
                ],
                approvals: [
                    { id: 'apr_p3_tf_1', type: 'council', name: 'Licença de utilização', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' },
                    { id: 'apr_p3_tf_2', type: 'client', name: 'Aceitação final', status: 'pending', submittedAt: null, respondedAt: null, respondedBy: null, notes: '' }
                ],
                photos: [], notes: []
            }
        ],
        visits: [
            {
                id: 'v_p3_1',
                date: '2026-04-02',
                participants: ['u1', 'u2'],
                notes: 'Primeira visita ao local. Edifício existente com sinais de humidade e fissuras na fachada tardoz.',
                photos: ['ferreira_fachada.jpg', 'ferreira_interior.jpg', 'ferreira_quintal.jpg'],
                actions: [
                    { id: 'va_200', description: 'Solicitar levantamento topográfico', status: 'open', responsible: 'u1' },
                    { id: 'va_201', description: 'Verificar existência de amianto na cobertura', status: 'open', responsible: 'u2' }
                ]
            }
        ],
        timeLogs: [
            { id: 'tl_200', date: '2026-04-01', hours: 2.0, phase: 'pp', description: 'Reunião com cliente Ferreira', user: 'u1', billable: true },
            { id: 'tl_201', date: '2026-04-02', hours: 3.0, phase: 'pp', description: 'Visita ao local e levantamento fotográfico', user: 'u2', billable: true },
            { id: 'tl_202', date: '2026-04-05', hours: 4.0, phase: 'pp', description: 'Levantamento do existente', user: 'u2', billable: true },
            { id: 'tl_203', date: '2026-04-08', hours: 1.5, phase: 'pp', description: 'Análise PDM Gaia', user: 'u1', billable: true }
        ],
        pendencias: [
            { id: 'pend_p3_1', description: 'Aguardar levantamento topográfico do Topógrafo João', priority: 'high', responsible: 'e5', deadline: '2026-04-15', status: 'open', phase: 'pp', createdAt: '2026-04-02' },
            { id: 'pend_p3_2', description: 'Concluir programa funcional com requisitos do cliente', priority: 'high', responsible: 'u1', deadline: '2026-04-18', status: 'open', phase: 'pp', createdAt: '2026-04-05' },
            { id: 'pend_p3_3', description: 'Verificar condicionantes ARU de Gaia', priority: 'medium', responsible: 'u2', deadline: '2026-04-20', status: 'open', phase: 'pp', createdAt: '2026-04-03' },
            { id: 'pend_p3_4', description: 'Verificar existência de amianto na cobertura', priority: 'high', responsible: 'u2', deadline: '2026-04-12', status: 'open', phase: 'pp', createdAt: '2026-04-02' }
        ],
        posts: [],
        history: [
            { date: '2026-04-05', user: 'u2', action: 'Carregou documento', detail: 'Levantamento_Ferreira_v1.dwg no Programa Preliminar', phase: 'pp' },
            { date: '2026-04-02', user: 'u2', action: 'Registou visita', detail: 'Primeira visita ao local', phase: 'pp' },
            { date: '2026-04-01', user: 'u1', action: 'Criou projecto', detail: 'Moradia Ferreira criado a partir do template Moradia Unifamiliar', phase: null }
        ]
    }
];



const QUOTES = [
  {
    id: 'QT-1700000001',
    reference: 'ORC-2026-001',
    version: 1,
    status: 'accepted',           // este já gerou projecto
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-15T14:00:00.000Z',
    sentAt:    '2026-01-12T10:00:00.000Z',
    acceptedAt:'2026-01-15T14:00:00.000Z',
    rejectedAt: null,
    validUntil: '2026-02-10T09:00:00.000Z',
    projectId: 'p1',              // já ligado ao projecto Moradia Silva

    client: {
      name:  'António Silva',
      email: 'antonio.silva@email.pt',
      phone: '+351 920 123 456',
      nif:   '123456789'
    },
    brief: {
      projectName: 'Moradia Silva',
      type:        'moradia',
      subtype:     'nova_construcao',
        area: 280,
      location:    'porto',
      quality:     'alta',
      urgency:     'normal',
      complexity:  'normal',
      clientBudget: 85000,
      notes: 'Moradia T4 com garagem e piscina.'
    },
    scope: {
      templateId: 'moradia',
      phases: [
        { id:'ep', label:'Estudo Prévio',       estimatedHours:20, fixedPrice:0, included:true  },
        { id:'ap', label:'Ante-Projecto',        estimatedHours:28, fixedPrice:0, included:true  },
        { id:'la', label:'Licenciamento',        estimatedHours:24, fixedPrice:0, included:true  },
        { id:'pe', label:'Projecto de Execução', estimatedHours:48, fixedPrice:0, included:true  },
        { id:'at', label:'Assistência Técnica',  estimatedHours:30, fixedPrice:0, included:false },
        { id:'tf', label:'Telas Finais',         estimatedHours: 8, fixedPrice:0, included:false }
      ],
      deliverables: [
        { id:'render_3d',    label:'Renders 3D',            unitPrice:400, qty:1, included:true  },
        { id:'mapa_acab',    label:'Mapa de Acabamentos',    unitPrice:200, qty:1, included:true  },
        { id:'medicoes',     label:'Mapa de Medições',       unitPrice:350, qty:1, included:false },
        { id:'visita_extra', label:'Visita Extra à Obra',    unitPrice:120, qty:1, included:false },
        { id:'coord_esp',    label:'Coord. Especialidades',  unitPrice:500, qty:1, included:false },
        { id:'mob_design',   label:'Design de Mobiliário',   unitPrice:600, qty:1, included:false },
        { id:'cad_enc',      label:'Caderno de Encargos',    unitPrice:300, qty:1, included:false }
      ],
      exclusions: [
        'Taxas e licenças camarárias',
        'Levantamento topográfico',
        'Projectos de especialidades (Estruturas, AVAC, Eléctricas)',
        'Ensaios e inspecções',
        'Trabalhos fora do âmbito definido'
      ],
      assumptions: '• Área de 280 m² indicada pelo cliente (sem levantamento rigoroso incluído)\n• Programa sem alterações substanciais após aprovação do Estudo Prévio\n• Até 2 reuniões presenciais por fase incluídas\n• Até 2 revisões por fase incluídas\n• Prazo de validade desta proposta: 30 dias',
      includedMeetings: 2,
      includedRevisions: 2,
      includedSiteVisits: 0
    },
    fees: {
      model:       'hourly',
      ratePerHour: 75,
      percentage:  8,
      constructionEstimate: 462000,
      constructionEstimateIsManual: false,
      internalRoles: [
        { role:'senior', label:'Arq. Sénior', hours:60, costRate:35 },
        { role:'junior', label:'Arq. Júnior', hours:36, costRate:22 },
        { role:'bim',    label:'Desenho/BIM', hours:24, costRate:18 }
      ],
      paymentSchedule: [
        { trigger:'Adjudicação',              percentage:30, amount:2592  },
        { trigger:'Entrega Ante-Projecto',    percentage:20, amount:1728  },
        { trigger:'Entrega Licenciamento',    percentage:20, amount:1728  },
        { trigger:'Entrega Projecto de Execução',   percentage:30, amount:2592  }
      ],
      summary: {
        base:           9000,
        optionals:       600,
        subtotal:        9600,
        vatRate:          23,
        vat:            2208,
        total:         11808,
        internalCost:   2928,
        grossMargin:    6672,
        grossMarginPct:   69
      }
    },
    proposal: {
      intro: 'Conforme solicitado, apresentamos a nossa proposta de honorários para a elaboração do projecto em epígrafe.',
      includeConstructionEstimate: true,
      validityDays: 30,
      legalNotes: 'Os valores apresentados não incluem taxas camarárias, taxas de apreciação por entidades externas, levantamento topográfico ou cópias impressas adicionais.'
    }
  },

  {
    id: 'QT-1700000002',
    reference: 'ORC-2026-002',
    version: 1,
    status: 'draft',
    createdAt: '2026-03-20T10:00:00.000Z',
    updatedAt: '2026-03-20T10:00:00.000Z',
    sentAt:     null,
    acceptedAt: null,
    rejectedAt: null,
    validUntil: '2026-04-20T10:00:00.000Z',
    projectId:  null,             // ainda não gerou projecto

    client: {
      name:  'Ricardo Monteiro',
      email: 'r.monteiro@email.pt',
      phone: '+351 931 000 111',
      nif:   ''
    },
    brief: {
      projectName: 'Apartamento Monteiro',
      type:        'reabilitacao',
      subtype:     'reabilitacao_parcial',
      area:        95,
      location:    'lisboa',
      quality:     'alta',
      urgency:     'normal',
      complexity:  'normal',
      clientBudget: null,
      notes: 'Reabilitação completa de apartamento T2 em Lisboa.'
    },
    scope: {
      templateId: 'reabilitacao',
      phases: [
        { id:'ep', label:'Estudo Prévio',       estimatedHours:24, fixedPrice:0, included:true  },
        { id:'la', label:'Licenciamento',        estimatedHours:28, fixedPrice:0, included:true  },
        { id:'pe', label:'Projecto de Execução', estimatedHours:56, fixedPrice:0, included:true  },
        { id:'at', label:'Assistência Técnica',  estimatedHours:32, fixedPrice:0, included:false },
        { id:'tf', label:'Telas Finais',         estimatedHours: 8, fixedPrice:0, included:false }
      ],
      deliverables: [
        { id:'render_3d',    label:'Renders 3D',            unitPrice:400, qty:1, included:false },
        { id:'mapa_acab',    label:'Mapa de Acabamentos',    unitPrice:200, qty:1, included:true  },
        { id:'medicoes',     label:'Mapa de Medições',       unitPrice:350, qty:1, included:false },
        { id:'visita_extra', label:'Visita Extra à Obra',    unitPrice:120, qty:1, included:false },
        { id:'coord_esp',    label:'Coord. Especialidades',  unitPrice:500, qty:1, included:false },
        { id:'mob_design',   label:'Design de Mobiliário',   unitPrice:600, qty:1, included:false },
        { id:'cad_enc',      label:'Caderno de Encargos',    unitPrice:300, qty:1, included:false }
      ],
      exclusions: [
        'Levantamento do existente',
        'Ensaios estruturais e inspecções',
        'Projectos de especialidades',
        'Taxas camarárias',
        'Imprevistos decorrentes do estado do existente'
      ],
      assumptions: '• Estado de conservação do existente conforme descrito pelo cliente\n• Eventuais patologias ocultas podem implicar revisão de honorários\n• Levantamento rigoroso do existente não incluído\n• Até 2 reuniões presenciais por fase incluídas\n• Prazo de validade desta proposta: 30 dias',
      includedMeetings: 2,
      includedRevisions: 2,
      includedSiteVisits: 0
    },
    fees: {
      model:       'hourly',
      ratePerHour: 75,
      percentage:  8,
      constructionEstimate: null,
      constructionEstimateIsManual: false,
      internalRoles: [
        { role:'senior', label:'Arq. Sénior', hours:54, costRate:35 },
        { role:'junior', label:'Arq. Júnior', hours:32, costRate:22 },
        { role:'bim',    label:'Desenho/BIM', hours:22, costRate:18 }
      ],
      paymentSchedule: [
        { trigger:'Adjudicação',              percentage:30, amount:1989  },
        { trigger:'Entrega Licenciamento',    percentage:30, amount:1989  },
        { trigger:'Entrega Projecto de Execução',   percentage:40, amount:2652  }
      ],
      summary: {
        base:           8100,
        optionals:       200,
        subtotal:        8300,
        vatRate:          23,
        vat:            1909,
        total:         10209,
        internalCost:   2639,
        grossMargin:    5661,
        grossMarginPct:   68
      }
    },
    proposal: {
      intro: 'Conforme solicitado, apresentamos a nossa proposta de honorários para a elaboração do projecto em epígrafe.',
      includeConstructionEstimate: false,
      validityDays: 30,
      legalNotes: 'Os valores apresentados não incluem taxas camarárias, taxas de apreciação por entidades externas, levantamento topográfico ou cópias impressas adicionais.'
    }
  }
];

