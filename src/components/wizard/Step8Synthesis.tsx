import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SteeringPanel } from '@/components/SteeringPanel'
import { CitationAudit } from '@/components/CitationAudit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Download } from 'lucide-react'
import { exportMarkdown, exportDocx } from '@/lib/export'
import type { ManuscriptSection } from '@/types/project'
import { SYSTEMATIC_REVIEW_TEMPLATE } from '@/templates/systematic-review'

const SECTIONS = [
  { key: 'abstract', label: 'Structured Abstract' },
  { key: 'introduction', label: 'Introduction' },
  { key: 'methods', label: 'Materials and Methods' },
  { key: 'results', label: 'Results' },
  { key: 'discussion', label: 'Discussion' },
  { key: 'conclusions', label: 'Conclusions' },
] as const

export function Step8Synthesis() {
  const { activeProject, updateProject, setStep } = useProjectStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('introduction')

  if (!activeProject) return null
  const p = activeProject
  const included = p.records.filter((r) => r.screeningDecision === 'include')

  const generateSection = async (sectionKey: string) => {
    setLoading(sectionKey)
    try {
      const template = SYSTEMATIC_REVIEW_TEMPLATE.sections[sectionKey as keyof typeof SYSTEMATIC_REVIEW_TEMPLATE.sections]
      const prompt = `Write the "${sectionKey}" section for a systematic review manuscript.

Title: ${p.title}
Aim: ${p.aim}
Research questions: ${p.researchQuestions.join('; ')}
Inclusion criteria: ${p.config.inclusionCriteria.join('; ')}
Studies included: ${included.length}
Extraction data: ${JSON.stringify(p.extractions)}
Quality appraisals: ${JSON.stringify(p.qualityAppraisals)}
Steering: emphasis=${p.steering.findingEmphasis}, focus=${p.steering.synthesisFocus}
Word limit for section: ~${Math.floor(p.steering.wordLimit / 6)} words

${template}

Use UK academic English. Cite included studies as [Author, Year]. Do not invent citations.`

      const res = await api.generate(prompt, included)
      const section = p.manuscript[sectionKey as keyof typeof p.manuscript] as ManuscriptSection
      const updated = {
        ...p.manuscript,
        title: p.title,
        [sectionKey]: {
          ...section,
          content: res.text,
          wordCount: res.text.split(/\s+/).length,
        },
      }
      await updateProject({ manuscript: updated, synthesis: { ...p.synthesis, narrative: res.text } })
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(null)
    }
  }

  const generateAll = async () => {
    for (const { key } of SECTIONS) {
      await generateSection(key)
    }
  }

  const updateSectionContent = (key: string, content: string) => {
    const section = p.manuscript[key as keyof typeof p.manuscript] as ManuscriptSection
    updateProject({
      manuscript: {
        ...p.manuscript,
        [key]: { ...section, content, wordCount: content.split(/\s+/).length },
      },
    })
  }

  const currentSection = p.manuscript[activeSection as keyof typeof p.manuscript] as ManuscriptSection

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button onClick={generateAll} disabled={!!loading}>
            {loading === 'all' && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate Full Manuscript
          </Button>
          <Button variant="outline" onClick={() => exportMarkdown(p)}>
            <Download className="h-4 w-4" /> Markdown
          </Button>
          <Button variant="outline" onClick={() => exportDocx(p)}>
            <Download className="h-4 w-4" /> DOCX
          </Button>
          <Button variant="outline" onClick={() => setStep(7)}>← Back</Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {SECTIONS.map(({ key, label }) => (
            <Button
              key={key}
              variant={activeSection === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{currentSection?.title || activeSection}</CardTitle>
            <Button size="sm" onClick={() => generateSection(activeSection)} disabled={!!loading}>
              {loading === activeSection && <Loader2 className="h-4 w-4 animate-spin" />}
              Regenerate
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={16}
              value={currentSection?.content || ''}
              onChange={(e) => updateSectionContent(activeSection, e.target.value)}
              placeholder="Section content will appear here..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              {currentSection?.wordCount || 0} words
            </p>
          </CardContent>
        </Card>

        <CitationAudit manuscript={p.manuscript} citations={p.citations} records={included} />
      </div>

      <div>
        <SteeringPanel
          steering={p.steering}
          onChange={(updates) => updateProject({ steering: { ...p.steering, ...updates } })}
        />
      </div>
    </div>
  )
}
