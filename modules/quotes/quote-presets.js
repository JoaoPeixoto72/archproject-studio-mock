// ============================================================================
// ArchProject — quote-presets.js
// Predefinições para o módulo de orçamentação
// ============================================================================

const PRICE_BENCHMARKS = {
  lisboa:         { baixa: 1350, media: 1650, alta: 1950, luxo: 2600 },
  porto:          { baixa: 1250, media: 1550, alta: 1850, luxo: 2400 },
  algarve:        { baixa: 1450, media: 1750, alta: 2100, luxo: 2800 },
  centro:         { baixa: 1050, media: 1350, alta: 1650, luxo: 2100 },
  norte_interior: { baixa:  950, media: 1250, alta: 1550, luxo: 1950 }
};

const DELIVERABLES_LIBRARY = [
  { id: 'render_3d',    label: 'Renders 3D',             unitPrice: 400, qty: 1 },
  { id: 'mapa_acab',    label: 'Mapa de Acabamentos',     unitPrice: 200, qty: 1 },
  { id: 'medicoes',     label: 'Mapa de Medições',        unitPrice: 350, qty: 1 },
  { id: 'visita_extra', label: 'Visita Extra à Obra',     unitPrice: 120, qty: 1 },
  { id: 'coord_esp',    label: 'Coord. de Especialidades',unitPrice: 500, qty: 1 },
  { id: 'mob_design',   label: 'Design de Mobiliário',    unitPrice: 600, qty: 1 },
  { id: 'cad_enc',      label: 'Caderno de Encargos',     unitPrice: 300, qty: 1 }
];

const QUOTE_TEMPLATES = {

  moradia: {
    label: 'Moradia Unifamiliar',
    phases: [
      { id: 'ep', label: 'Estudo Prévio',         estimatedHours: 20, fixedPrice: 0, included: true  },
      { id: 'ap', label: 'Ante-Projecto',          estimatedHours: 28, fixedPrice: 0, included: true  },
      { id: 'la', label: 'Licenciamento',          estimatedHours: 24, fixedPrice: 0, included: true  },
      { id: 'pe', label: 'Projecto de Execução',   estimatedHours: 48, fixedPrice: 0, included: true  },
      { id: 'at', label: 'Assistência Técnica',    estimatedHours: 30, fixedPrice: 0, included: false },
      { id: 'tf', label: 'Telas Finais',           estimatedHours:  8, fixedPrice: 0, included: false }
    ],
    exclusions: [
      'Taxas e licenças camarárias',
      'Levantamento topográfico',
      'Projectos de especialidades (Estruturas, AVAC, Eléctricas)',
      'Ensaios e inspecções',
      'Trabalhos fora do âmbito definido'
    ],
    assumptions: [
      'Área de [X] m² indicada pelo cliente (sem levantamento rigoroso incluído)',
      'Programa sem alterações substanciais após aprovação do Estudo Prévio',
      'Até 2 reuniões presenciais por fase incluídas',
      'Até 2 revisões por fase incluídas',
      'Prazo de validade desta proposta: 30 dias'
    ]
  },

  reabilitacao: {
    label: 'Reabilitação',
    phases: [
      { id: 'ep', label: 'Estudo Prévio',         estimatedHours: 24, fixedPrice: 0, included: true  },
      { id: 'la', label: 'Licenciamento',          estimatedHours: 28, fixedPrice: 0, included: true  },
      { id: 'pe', label: 'Projecto de Execução',   estimatedHours: 56, fixedPrice: 0, included: true  },
      { id: 'at', label: 'Assistência Técnica',    estimatedHours: 32, fixedPrice: 0, included: false },
      { id: 'tf', label: 'Telas Finais',           estimatedHours:  8, fixedPrice: 0, included: false }
    ],
    exclusions: [
      'Levantamento do existente',
      'Ensaios estruturais e inspecções',
      'Projectos de especialidades',
      'Taxas camarárias',
      'Imprevistos decorrentes do estado do existente'
    ],
    assumptions: [
      'Estado de conservação do existente conforme descrito pelo cliente',
      'Eventuais patologias ocultas podem implicar revisão de honorários',
      'Levantamento rigoroso do existente não incluído',
      'Até 2 reuniões presenciais por fase incluídas',
      'Prazo de validade desta proposta: 30 dias'
    ]
  },

  comercial: {
    label: 'Projecto Comercial',
    phases: [
      { id: 'ep', label: 'Estudo Prévio',         estimatedHours: 16, fixedPrice: 0, included: true  },
      { id: 'la', label: 'Licenciamento',          estimatedHours: 20, fixedPrice: 0, included: true  },
      { id: 'pe', label: 'Projecto de Execução',   estimatedHours: 40, fixedPrice: 0, included: true  },
      { id: 'at', label: 'Assistência Técnica',    estimatedHours: 24, fixedPrice: 0, included: false }
    ],
    exclusions: [
      'Taxas e licenças',
      'Projectos de especialidades AVAC/Eléctricas/Segurança',
      'Projecto de som e iluminação cénica',
      'Sinalética e branding'
    ],
    assumptions: [
      'Programa de necessidades estabilizado antes do início dos trabalhos',
      'Acesso ao espaço garantido pelo cliente para medições',
      'Prazo de validade desta proposta: 30 dias'
    ]
  },

  interiores: {
    label: 'Design de Interiores',
    phases: [
      { id: 'ep', label: 'Conceito e Estudo Prévio', estimatedHours: 12, fixedPrice: 0, included: true  },
      { id: 'pe', label: 'Projecto de Execução',      estimatedHours: 28, fixedPrice: 0, included: true  },
      { id: 'at', label: 'Acompanhamento de Obra',    estimatedHours: 16, fixedPrice: 0, included: false }
    ],
    exclusions: [
      'Obra e materiais',
      'Mobiliário e equipamentos',
      'Projecto de iluminação especializado',
      'Aquisição de peças ou produtos'
    ],
    assumptions: [
      'Levantamento do espaço realizado pelo cliente ou incluído como extra',
      'Até 3 revisões do conceito incluídas',
      'Prazo de validade desta proposta: 30 dias'
    ]
  }
};
