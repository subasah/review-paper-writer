import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { StudyTable } from '@/components/StudyTable'
import { PrismaFlowchart } from '@/components/PrismaFlowchart'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'
import type { ScreeningDecision } from '@/types/project'

export function Step5PrismaSelection() {
  const { activeProject, updateRecord, setStep } = useProjectStore()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  if (!activeProject) return null
  const p = activeProject

  const runScreening = async () => {
    setLoading(true)
    setProgress(10)
    try {
      const pending = p.records.filter((r) => r.screeningDecision === 'pending')
      const res = await api.screen(
        pending.length > 0 ? pending : p.records,
        p.config.inclusionCriteria,
        p.config.exclusionCriteria,
        p.steering.inclusionStrictness
      )
      setProgress(80)
      for (const d of res.decisions) {
        await updateRecord(d.studyId, {
          screeningDecision: d.decision as ScreeningDecision,
          screeningReason: d.reason,
        })
      }
      setProgress(100)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const bulkApprove = async (decision: ScreeningDecision) => {
    for (const r of p.records) {
      if (r.screeningDecision === 'pending' || r.screeningDecision === 'maybe') {
        await updateRecord(r.id, { screeningDecision: decision })
      }
    }
  }

  const included = p.records.filter((r) => r.screeningDecision === 'include').length

  return (
    <div className="space-y-6">
      <PrismaFlowchart prisma={p.prisma} />

      <div className="flex flex-wrap gap-3">
        <Button onClick={runScreening} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          AI Screen All
        </Button>
        <Button variant="outline" onClick={() => bulkApprove('include')}>Bulk Include Maybes</Button>
        <Button variant="outline" onClick={() => bulkApprove('exclude')}>Bulk Exclude Pending</Button>
        <Button variant="outline" onClick={() => setStep(4)}>← Back</Button>
        <Button onClick={() => setStep(6)} disabled={included === 0}>
          Continue ({included} included) →
        </Button>
      </div>

      {loading && <Progress value={progress} />}

      <StudyTable
        records={p.records}
        showScreening
        onUpdate={(id, decision) => updateRecord(id, { screeningDecision: decision })}
      />
    </div>
  )
}
