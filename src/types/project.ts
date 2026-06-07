export type AcademicLevel = 'undergraduate' | 'masters' | 'phd'
export type DatabaseSource = 'pubmed' | 'openalex' | 'semantic_scholar' | 'scopus' | 'wos' | 'gemini_search'
export type ScreeningDecision = 'include' | 'exclude' | 'maybe' | 'pending'
export type QualityTool = 'jbi' | 'casp' | 'mmat'
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface StudyRecord {
  id: string
  title: string
  authors: string[]
  year: number
  abstract: string
  doi?: string
  pmid?: string
  url?: string
  source: DatabaseSource
  journal?: string
  screeningDecision: ScreeningDecision
  screeningReason?: string
  fullTextAvailable?: boolean
}

export interface PrismaCounts {
  identification: number
  duplicatesRemoved: number
  recordsScreened: number
  recordsExcluded: number
  fullTextAssessed: number
  fullTextExcluded: number
  studiesIncluded: number
  perSource: Record<string, number>
}

export interface ExtractionRow {
  studyId: string
  authorYear: string
  country: string
  sampleSize: string
  ageGroup: string
  measuresUsed: string
  keyFindings: string
  intervention?: string
  outcome?: string
}

export interface QualityRow {
  studyId: string
  tool: QualityTool
  scores: Record<string, string>
  overallRating: string
  notes: string
}

export interface Citation {
  id: string
  studyId: string
  text: string
  vancouver?: string
}

export interface ManuscriptSection {
  id: string
  title: string
  content: string
  citationIds: string[]
  wordCount: number
}

export interface ManuscriptSections {
  title: string
  abstract: ManuscriptSection
  introduction: ManuscriptSection
  methods: ManuscriptSection
  results: ManuscriptSection
  discussion: ManuscriptSection
  conclusions: ManuscriptSection
  ethics: ManuscriptSection
  acknowledgments: ManuscriptSection
  funding: ManuscriptSection
  conflictsOfInterest: ManuscriptSection
  authorContribution: ManuscriptSection
  references: string[]
}

export interface SteeringConfig {
  findingEmphasis: 'supportive' | 'neutral' | 'critical'
  inclusionStrictness: number
  synthesisFocus: 'population' | 'methodology' | 'theory' | 'practical'
  wordLimit: number
  teamAssignments: Record<WizardStep, 'personA' | 'personB' | 'both'>
}

export interface ReviewProject {
  id: string
  title: string
  field: string
  level: AcademicLevel
  teamSize: 2
  broadArea: string
  background: string
  context: string
  researchProblem: string
  aim: string
  objectives: string[]
  researchQuestions: string[]
  currentStep: WizardStep
  createdAt: string
  updatedAt: string
  config: {
    yearRange: { from: number; to: number }
    databases: DatabaseSource[]
    inclusionCriteria: string[]
    exclusionCriteria: string[]
    searchRadiusYears: number
  }
  searchStrategy: { keywords: string; booleanQuery: string }
  records: StudyRecord[]
  prisma: PrismaCounts
  extractions: ExtractionRow[]
  qualityAppraisals: QualityRow[]
  synthesis: { narrative: string; gaps: string[] }
  manuscript: ManuscriptSections
  citations: Citation[]
  steering: SteeringConfig
  selectedTopic?: TopicIdea
}

export interface TopicIdea {
  title: string
  researchProblem: string
  whyItMatters: string
  researchQuestions: string[]
  keyVariables: string[]
  methodology: string
  dataSources: string[]
  feasibility: string
  contribution: string
  limitations: string[]
}

export interface AppSettings {
  apiBaseUrl: string
  scopusApiKey?: string
  wosApiKey?: string
}

export const WIZARD_STEPS = [
  { step: 1, title: 'Research Question', description: 'Define your research topic' },
  { step: 2, title: 'Search Strategy', description: 'Build Boolean search query' },
  { step: 3, title: 'Database Search', description: 'Search literature databases' },
  { step: 4, title: 'Inclusion Criteria', description: 'Set inclusion/exclusion rules' },
  { step: 5, title: 'PRISMA Selection', description: 'Screen and select studies' },
  { step: 6, title: 'Quality Appraisal', description: 'Assess study quality' },
  { step: 7, title: 'Data Extraction', description: 'Extract study data' },
  { step: 8, title: 'Synthesis & Writing', description: 'Generate review manuscript' },
] as const

export function createEmptyManuscript(): ManuscriptSections {
  const empty = (id: string, title: string): ManuscriptSection => ({
    id,
    title,
    content: '',
    citationIds: [],
    wordCount: 0,
  })
  return {
    title: '',
    abstract: empty('abstract', 'Structured Abstract'),
    introduction: empty('introduction', 'Introduction'),
    methods: empty('methods', 'Materials and Methods'),
    results: empty('results', 'Results'),
    discussion: empty('discussion', 'Discussion'),
    conclusions: empty('conclusions', 'Conclusions'),
    ethics: empty('ethics', 'Ethics Approval'),
    acknowledgments: empty('acknowledgments', 'Acknowledgments'),
    funding: empty('funding', 'Funding'),
    conflictsOfInterest: empty('coi', 'Conflicts of Interest'),
    authorContribution: empty('author', 'Author Contribution'),
    references: [],
  }
}

export function createEmptyProject(): ReviewProject {
  const currentYear = new Date().getFullYear()
  return {
    id: crypto.randomUUID(),
    title: 'Untitled Systematic Review',
    field: '',
    level: 'masters',
    teamSize: 2,
    broadArea: '',
    background: '',
    context: '',
    researchProblem: '',
    aim: '',
    objectives: [],
    researchQuestions: [],
    currentStep: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      yearRange: { from: currentYear - 10, to: currentYear },
      databases: ['pubmed', 'openalex', 'semantic_scholar'],
      inclusionCriteria: [],
      exclusionCriteria: [],
      searchRadiusYears: 10,
    },
    searchStrategy: { keywords: '', booleanQuery: '' },
    records: [],
    prisma: {
      identification: 0,
      duplicatesRemoved: 0,
      recordsScreened: 0,
      recordsExcluded: 0,
      fullTextAssessed: 0,
      fullTextExcluded: 0,
      studiesIncluded: 0,
      perSource: {},
    },
    extractions: [],
    qualityAppraisals: [],
    synthesis: { narrative: '', gaps: [] },
    manuscript: createEmptyManuscript(),
    citations: [],
    steering: {
      findingEmphasis: 'neutral',
      inclusionStrictness: 50,
      synthesisFocus: 'methodology',
      wordLimit: 5000,
      teamAssignments: {
        1: 'both', 2: 'personA', 3: 'personA', 4: 'personB',
        5: 'personB', 6: 'personA', 7: 'personB', 8: 'both',
      },
    },
  }
}
