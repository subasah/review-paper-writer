import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TopicIdea, AcademicLevel } from '@/types/project'
import { Loader2 } from 'lucide-react'

export function Step1ResearchQuestion() {
  const { activeProject, updateProject, setStep } = useProjectStore()
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState<TopicIdea[]>([])
  const [numTopics, setNumTopics] = useState('5')

  if (!activeProject) return null
  const p = activeProject

  const generateTopics = async () => {
    setLoading(true)
    try {
      const prompt = `Act as a senior academic supervisor in ${p.field}.
I am a ${p.level} student interested in ${p.broadArea}. My academic background is ${p.background}, and my preferred research context is ${p.context}.
Generate ${numTopics} strong systematic review topic ideas suitable for a team of 2 people to publish.
Return JSON array with: title, researchProblem, whyItMatters, researchQuestions (array), keyVariables (array), methodology, dataSources (array), feasibility, contribution, limitations (array).`
      const res = await api.generate(prompt, undefined, true)
      const parsed = (res.structured || JSON.parse(res.text)) as TopicIdea[]
      setTopics(Array.isArray(parsed) ? parsed : [])
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const selectTopic = async (topic: TopicIdea) => {
    await updateProject({
      title: topic.title.includes('Systematic Review') ? topic.title : `${topic.title}: A Systematic Review`,
      researchProblem: topic.researchProblem,
      aim: `To systematically review evidence on ${topic.title}`,
      researchQuestions: topic.researchQuestions,
      selectedTopic: topic,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Field</Label>
          <Input value={p.field} onChange={(e) => updateProject({ field: e.target.value })} placeholder="e.g. Psychology" className="mt-1" />
        </div>
        <div>
          <Label>Academic Level</Label>
          <Select value={p.level} onValueChange={(v) => updateProject({ level: v as AcademicLevel })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="masters">Master's</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Broad Area</Label>
          <Input value={p.broadArea} onChange={(e) => updateProject({ broadArea: e.target.value })} placeholder="e.g. CBT for anxiety in college students" className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label>Academic Background</Label>
          <Textarea value={p.background} onChange={(e) => updateProject({ background: e.target.value })} placeholder="Brief background" className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label>Research Context</Label>
          <Input value={p.context} onChange={(e) => updateProject({ context: e.target.value })} placeholder="Country/region/population" className="mt-1" />
        </div>
        <div>
          <Label>Number of Topics</Label>
          <Input type="number" value={numTopics} onChange={(e) => setNumTopics(e.target.value)} min={3} max={10} className="mt-1" />
        </div>
      </div>

      <Button onClick={generateTopics} disabled={loading || !p.field || !p.broadArea}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Generate Topic Ideas
      </Button>

      {topics.length > 0 && (
        <div className="grid gap-4">
          {topics.map((topic, i) => (
            <Card key={i} className={p.selectedTopic?.title === topic.title ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <CardTitle className="text-base">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Problem:</strong> {topic.researchProblem}</p>
                <p><strong>Why it matters:</strong> {topic.whyItMatters}</p>
                <p><strong>Feasibility:</strong> {topic.feasibility}</p>
                <Button size="sm" onClick={() => selectTopic(topic)}>Select This Topic</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {p.selectedTopic && (
        <div className="flex justify-end">
          <Button onClick={() => setStep(2)}>Continue to Search Strategy →</Button>
        </div>
      )}
    </div>
  )
}
