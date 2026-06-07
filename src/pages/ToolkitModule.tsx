import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPromptModule } from '@/prompts'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function ToolkitModule() {
  const { module: moduleId } = useParams<{ module: string }>()
  const module = getPromptModule(moduleId || '')
  const { activeProject, loadProjects } = useProjectStore()
  const [values, setValues] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (activeProject && module) {
      setValues((v) => ({
        ...v,
        topic: activeProject.title,
        field: activeProject.field,
        level: activeProject.level,
        context: activeProject.context,
        aim: activeProject.aim,
        questions: activeProject.researchQuestions.join('\n'),
        problem: activeProject.researchProblem,
        researchArea: activeProject.broadArea,
      }))
    }
  }, [activeProject, module])

  if (!module) {
    return <p>Module not found. <Link to="/toolkit">Back to toolkit</Link></p>
  }

  const run = async () => {
    setLoading(true)
    try {
      const prompt = module.buildPrompt(values)
      const res = await api.generate(prompt, activeProject?.records)
      setOutput(res.text)
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/toolkit"><ArrowLeft className="h-4 w-4" /> Toolkit</Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{module.name}</h1>
          <p className="text-sm text-muted-foreground">{module.description}</p>
        </div>
      </div>

      {activeProject && (
        <p className="text-xs text-muted-foreground bg-accent px-3 py-2 rounded-md">
          Pre-filled from active project: {activeProject.title}
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Input</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {module.fields.map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                {field.type === 'select' ? (
                  <Select value={values[field.key] || ''} onValueChange={(v) => setValues({ ...values, [field.key]: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    className="mt-1"
                    value={values[field.key] || ''}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    className="mt-1"
                    value={values[field.key] || ''}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
            <Button onClick={run} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Output</CardTitle></CardHeader>
          <CardContent>
            {output ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">{output}</div>
            ) : (
              <p className="text-muted-foreground text-sm">Output will appear here after generation.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
