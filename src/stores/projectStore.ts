import { create } from 'zustand'
import { get, set, del } from 'idb-keyval'
import {
  type ReviewProject,
  type StudyRecord,
  type WizardStep,
  type AppSettings,
  createEmptyProject,
} from '@/types/project'
import { deduplicateStudies, updatePrismaCounts } from '@/lib/dedup'

const PROJECTS_KEY = 'srw-projects'
const SETTINGS_KEY = 'srw-settings'
const ACTIVE_KEY = 'srw-active-project'

interface ProjectStore {
  projects: ReviewProject[]
  activeProject: ReviewProject | null
  settings: AppSettings
  loading: boolean
  loadProjects: () => Promise<void>
  loadSettings: () => Promise<void>
  saveSettings: (settings: AppSettings) => Promise<void>
  createProject: () => Promise<ReviewProject>
  setActiveProject: (id: string) => Promise<void>
  updateProject: (updates: Partial<ReviewProject>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setStep: (step: WizardStep) => Promise<void>
  addRecords: (records: StudyRecord[], perSource: Record<string, number>) => Promise<void>
  updateRecord: (id: string, updates: Partial<StudyRecord>) => Promise<void>
}

const defaultSettings: AppSettings = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
}

async function persistProjects(projects: ReviewProject[]) {
  await set(PROJECTS_KEY, projects)
}

async function persistProject(project: ReviewProject) {
  const projects = (await get<ReviewProject[]>(PROJECTS_KEY)) ?? []
  const idx = projects.findIndex((p) => p.id === project.id)
  if (idx >= 0) {
    projects[idx] = project
  } else {
    projects.push(project)
  }
  await persistProjects(projects)
}

export const useProjectStore = create<ProjectStore>((setState, getState) => ({
  projects: [],
  activeProject: null,
  settings: defaultSettings,
  loading: true,

  loadProjects: async () => {
    const projects = (await get<ReviewProject[]>(PROJECTS_KEY)) ?? []
    const activeId = await get<string>(ACTIVE_KEY)
    const active = projects.find((p) => p.id === activeId) ?? projects[0] ?? null
    setState({ projects, activeProject: active, loading: false })
  },

  loadSettings: async () => {
    const settings = (await get<AppSettings>(SETTINGS_KEY)) ?? defaultSettings
    setState({ settings })
  },

  saveSettings: async (settings) => {
    await set(SETTINGS_KEY, settings)
    setState({ settings })
  },

  createProject: async () => {
    const project = createEmptyProject()
    const projects = [...getState().projects, project]
    await persistProjects(projects)
    await set(ACTIVE_KEY, project.id)
    setState({ projects, activeProject: project })
    return project
  },

  setActiveProject: async (id) => {
    const project = getState().projects.find((p) => p.id === id)
    if (project) {
      await set(ACTIVE_KEY, id)
      setState({ activeProject: project })
    }
  },

  updateProject: async (updates) => {
    const current = getState().activeProject
    if (!current) return
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await persistProject(updated)
    const projects = getState().projects.map((p) =>
      p.id === updated.id ? updated : p
    )
    setState({ activeProject: updated, projects })
  },

  deleteProject: async (id) => {
    const projects = getState().projects.filter((p) => p.id !== id)
    await persistProjects(projects)
    if (getState().activeProject?.id === id) {
      await del(ACTIVE_KEY)
      setState({ activeProject: projects[0] ?? null })
    }
    setState({ projects })
  },

  setStep: async (step) => {
    await getState().updateProject({ currentStep: step })
  },

  addRecords: async (newRecords, perSource) => {
    const current = getState().activeProject
    if (!current) return
    const allRecords = [...current.records, ...newRecords]
    const { unique, duplicatesRemoved } = deduplicateStudies(allRecords)
    const prisma = updatePrismaCounts(unique, perSource)
    prisma.duplicatesRemoved = duplicatesRemoved
    await getState().updateProject({ records: unique, prisma })
  },

  updateRecord: async (id, updates) => {
    const current = getState().activeProject
    if (!current) return
    const records = current.records.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    )
    const prisma = updatePrismaCounts(records, current.prisma.perSource)
    prisma.duplicatesRemoved = current.prisma.duplicatesRemoved
    await getState().updateProject({ records, prisma })
  },
}))

export async function exportAllProjects(): Promise<ReviewProject[]> {
  return (await get<ReviewProject[]>(PROJECTS_KEY)) ?? []
}
