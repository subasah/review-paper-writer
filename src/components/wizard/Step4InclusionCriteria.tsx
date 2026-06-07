import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X } from 'lucide-react'

export function Step4InclusionCriteria() {
  const { activeProject, updateProject, setStep } = useProjectStore()
  const [loading, setLoading] = useState(false)

  if (!activeProject) return null
  const p = activeProject

  const generateCriteria = async () => {
    setLoading(true)
    try {
      const prompt = `For a systematic review titled "${p.title}", generate inclusion and exclusion criteria.
Research problem: ${p.researchProblem}
Return JSON: { "inclusionCriteria": ["..."], "exclusionCriteria": ["..."] }
Be specific about population, intervention, study design, outcomes, and language.`
      const res = await api.generate(prompt, p.records, true)
      const parsed = (res.structured || JSON.parse(res.text)) as {
        inclusionCriteria: string[]
        exclusionCriteria: string[]
      }
      await updateProject({
        config: {
          ...p.config,
          inclusionCriteria: parsed.inclusionCriteria,
          exclusionCriteria: parsed.exclusionCriteria,
        },
      })
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const updateList = (type: 'inclusion' | 'exclusion', index: number, value: string) => {
    const key = type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria'
    const list = [...p.config[key]]
    list[index] = value
    updateProject({ config: { ...p.config, [key]: list } })
  }

  const addItem = (type: 'inclusion' | 'exclusion') => {
    const key = type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria'
    updateProject({ config: { ...p.config, [key]: [...p.config[key], ''] } })
  }

  const removeItem = (type: 'inclusion' | 'exclusion', index: number) => {
    const key = type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria'
    updateProject({ config: { ...p.config, [key]: p.config[key].filter((_, i) => i !== index) } })
  }

  return (
    <div className="space-y-6">
      <Button onClick={generateCriteria} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        AI Suggest Criteria
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="text-green-700">Inclusion Criteria</Label>
          <div className="space-y-2 mt-2">
            {p.config.inclusionCriteria.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Textarea value={c} onChange={(e) => updateList('inclusion', i, e.target.value)} rows={2} />
                <Button variant="ghost" size="icon" onClick={() => removeItem('inclusion', i)}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addItem('inclusion')}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </div>
        <div>
          <Label className="text-red-700">Exclusion Criteria</Label>
          <div className="space-y-2 mt-2">
            {p.config.exclusionCriteria.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Textarea value={c} onChange={(e) => updateList('exclusion', i, e.target.value)} rows={2} />
                <Button variant="ghost" size="icon" onClick={() => removeItem('exclusion', i)}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addItem('exclusion')}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
        <Button onClick={() => setStep(5)} disabled={p.config.inclusionCriteria.length === 0}>Continue to PRISMA →</Button>
      </div>
    </div>
  )
}
