import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ArrowRight, Wrench } from 'lucide-react'
import { WIZARD_STEPS } from '@/types/project'

export function Dashboard() {
  const navigate = useNavigate()
  const { projects, activeProject, loading, loadProjects, createProject, setActiveProject, deleteProject } = useProjectStore()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleNew = async () => {
    const project = await createProject()
    navigate(`/project/${project.id}`)
  }

  if (loading) return <p className="text-muted-foreground">Loading projects...</p>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Systematic Review Projects</h1>
          <p className="text-muted-foreground mt-1">
            Guided 8-step workflow for teams of 2 — minimal intervention, citation-backed outputs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/toolkit"><Wrench className="h-4 w-4" /> Academic Toolkit</Link>
          </Button>
          <Button onClick={handleNew}><Plus className="h-4 w-4" /> New Review</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {WIZARD_STEPS.map(({ step, title, description }) => (
          <Card key={step} className="text-center">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-primary">{step}</div>
              <div className="text-xs font-medium mt-1">{title}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet. Start your first systematic review.</p>
            <Button onClick={handleNew}><Plus className="h-4 w-4" /> Create Project</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className={activeProject?.id === project.id ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>
                    {project.field || 'No field set'} · Step {project.currentStep}/8 · {project.records.length} records
                  </CardDescription>
                </div>
                <Badge>Step {project.currentStep}</Badge>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button asChild size="sm">
                  <Link to={`/project/${project.id}`}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveProject(project.id)}>Select</Button>
                <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
