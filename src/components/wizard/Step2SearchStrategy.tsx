import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function Step2SearchStrategy() {
  const { activeProject, updateProject, setStep } = useProjectStore()
  const [loading, setLoading] = useState(false)

  if (!activeProject) return null
  const p = activeProject

  const generateQuery = async () => {
    setLoading(true)
    try {
      const prompt = `Build a Boolean search query for a systematic review on: "${p.title}"
Research questions: ${p.researchQuestions.join('; ')}
Context: ${p.context}
Return JSON: { "keywords": "comma-separated main terms", "booleanQuery": "full Boolean query with AND/OR/NOT and synonyms in parentheses" }
Example format: ("Autism" OR "ASD") AND ("Self-Concept" OR "Self-Perception") AND (Adolescent* OR Youth)`
      const res = await api.generate(prompt, undefined, true)
      const parsed = (res.structured || JSON.parse(res.text)) as { keywords: string; booleanQuery: string }
      await updateProject({ searchStrategy: parsed })
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Keywords</Label>
        <Textarea
          className="mt-1"
          value={p.searchStrategy.keywords}
          onChange={(e) => updateProject({ searchStrategy: { ...p.searchStrategy, keywords: e.target.value } })}
          placeholder="Main concepts and synonyms"
        />
      </div>
      <div>
        <Label>Boolean Search Query</Label>
        <Textarea
          className="mt-1 font-mono text-sm"
          rows={4}
          value={p.searchStrategy.booleanQuery}
          onChange={(e) => updateProject({ searchStrategy: { ...p.searchStrategy, booleanQuery: e.target.value } })}
          placeholder='("term1" OR "synonym") AND ("term2")'
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={generateQuery} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          AI Generate Query
        </Button>
        <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
        <Button onClick={() => setStep(3)} disabled={!p.searchStrategy.booleanQuery}>Continue →</Button>
      </div>
    </div>
  )
}
