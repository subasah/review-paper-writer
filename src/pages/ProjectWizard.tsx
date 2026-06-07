import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { WizardNav } from '@/components/wizard/WizardNav'
import { Step1ResearchQuestion } from '@/components/wizard/Step1ResearchQuestion'
import { Step2SearchStrategy } from '@/components/wizard/Step2SearchStrategy'
import { Step3DatabaseSearch } from '@/components/wizard/Step3DatabaseSearch'
import { Step4InclusionCriteria } from '@/components/wizard/Step4InclusionCriteria'
import { Step5PrismaSelection } from '@/components/wizard/Step5PrismaSelection'
import { Step6QualityAppraisal } from '@/components/wizard/Step6QualityAppraisal'
import { Step7DataExtraction } from '@/components/wizard/Step7DataExtraction'
import { Step8Synthesis } from '@/components/wizard/Step8Synthesis'
import { WIZARD_STEPS } from '@/types/project'
import type { WizardStep } from '@/types/project'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const STEP_COMPONENTS = {
  1: Step1ResearchQuestion,
  2: Step2SearchStrategy,
  3: Step3DatabaseSearch,
  4: Step4InclusionCriteria,
  5: Step5PrismaSelection,
  6: Step6QualityAppraisal,
  7: Step7DataExtraction,
  8: Step8Synthesis,
}

export function ProjectWizard() {
  const { id } = useParams<{ id: string }>()
  const { activeProject, projects, loadProjects, setActiveProject, setStep } = useProjectStore()

  useEffect(() => {
    loadProjects().then(() => {
      if (id) setActiveProject(id)
    })
  }, [id, loadProjects, setActiveProject])

  const project = activeProject?.id === id ? activeProject : projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild className="mt-4"><Link to="/">Back to Dashboard</Link></Button>
      </div>
    )
  }

  const StepComponent = STEP_COMPONENTS[project.currentStep as WizardStep]
  const stepInfo = WIZARD_STEPS.find((s) => s.step === project.currentStep)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">Step {project.currentStep}: {stepInfo?.title}</p>
        </div>
      </div>

      <WizardNav
        currentStep={project.currentStep}
        onStepClick={(step) => setStep(step)}
      />

      <div className="bg-card rounded-lg border p-6">
        <StepComponent />
      </div>
    </div>
  )
}
