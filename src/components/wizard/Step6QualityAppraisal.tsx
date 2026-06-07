import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { QualityTool, QualityRow } from '@/types/project'

const TOOL_ITEMS: Record<QualityTool, string[]> = {
  jbi: ['Clear research question', 'Appropriate design', 'Recruitment', 'Exposure measurement', 'Outcome measurement', 'Confounding', 'Follow-up', 'Statistics', 'Outcome measurement 2', 'Appropriate analysis', 'Withdrawals'],
  casp: ['Clear aim', 'Appropriate methodology', 'Research design', 'Recruitment', 'Data collection', 'Ethical issues', 'Data analysis', 'Clear findings', 'Research value'],
  mmat: ['Screening questions', 'Qualitative', 'RCT', 'Non-randomized', 'Quantitative descriptive', 'Mixed methods'],
}

export function Step6QualityAppraisal() {
  const { activeProject, updateProject, setStep } = useProjectStore()
  if (!activeProject) return null
  const p = activeProject
  const included = p.records.filter((r) => r.screeningDecision === 'include')

  const getOrCreate = (studyId: string): QualityRow => {
    return p.qualityAppraisals.find((q) => q.studyId === studyId) || {
      studyId,
      tool: 'jbi' as QualityTool,
      scores: {},
      overallRating: '',
      notes: '',
    }
  }

  const updateQuality = (studyId: string, updates: Partial<QualityRow>) => {
    const existing = getOrCreate(studyId)
    const updated = { ...existing, ...updates }
    const appraisals = p.qualityAppraisals.filter((q) => q.studyId !== studyId)
    appraisals.push(updated)
    updateProject({ qualityAppraisals: appraisals })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Appraise quality of {included.length} included studies.</p>

      {included.map((study) => {
        const qa = getOrCreate(study.id)
        return (
          <div key={study.id} className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm line-clamp-1">{study.title}</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Appraisal Tool</Label>
                <Select value={qa.tool} onValueChange={(v) => updateQuality(study.id, { tool: v as QualityTool, scores: {} })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jbi">JBI Checklist</SelectItem>
                    <SelectItem value="casp">CASP</SelectItem>
                    <SelectItem value="mmat">MMAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Overall Rating</Label>
                <Select value={qa.overallRating} onValueChange={(v) => updateQuality(study.id, { overallRating: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High quality</SelectItem>
                    <SelectItem value="moderate">Moderate quality</SelectItem>
                    <SelectItem value="low">Low quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {TOOL_ITEMS[qa.tool].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs">
                  <span className="flex-1">{item}</span>
                  <Select
                    value={qa.scores[item] || ''}
                    onValueChange={(v) => updateQuality(study.id, { scores: { ...qa.scores, [item]: v } })}
                  >
                    <SelectTrigger className="w-20 h-7"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="unclear">Unclear</SelectItem>
                      <SelectItem value="na">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <Textarea
              placeholder="Notes"
              value={qa.notes}
              onChange={(e) => updateQuality(study.id, { notes: e.target.value })}
              rows={2}
            />
          </div>
        )
      })}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(5)}>← Back</Button>
        <Button onClick={() => setStep(7)}>Continue to Extraction →</Button>
      </div>
    </div>
  )
}
