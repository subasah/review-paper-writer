import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import type { ExtractionRow } from '@/types/project'

export function Step7DataExtraction() {
  const { activeProject, updateProject, setStep } = useProjectStore()
  const [loading, setLoading] = useState(false)

  if (!activeProject) return null
  const p = activeProject
  const included = p.records.filter((r) => r.screeningDecision === 'include')

  const runExtraction = async () => {
    setLoading(true)
    try {
      const res = await api.extract(included)
      await updateProject({ extractions: res.extractions })
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const updateRow = (studyId: string, field: keyof ExtractionRow, value: string) => {
    const extractions = p.extractions.map((e) =>
      e.studyId === studyId ? { ...e, [field]: value } : e
    )
    if (!extractions.find((e) => e.studyId === studyId)) {
      extractions.push({
        studyId,
        authorYear: '',
        country: '',
        sampleSize: '',
        ageGroup: '',
        measuresUsed: '',
        keyFindings: '',
        [field]: value,
      })
    }
    updateProject({ extractions })
  }

  const getRow = (studyId: string): ExtractionRow =>
    p.extractions.find((e) => e.studyId === studyId) || {
      studyId,
      authorYear: '',
      country: '',
      sampleSize: '',
      ageGroup: '',
      measuresUsed: '',
      keyFindings: '',
    }

  return (
    <div className="space-y-6">
      <Button onClick={runExtraction} disabled={loading || included.length === 0}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        AI Extract Data
      </Button>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {['Author (Year)', 'Country', 'Sample Size', 'Age Group', 'Measures', 'Key Findings'].map((h) => (
                <th key={h} className="text-left p-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {included.map((study) => {
              const row = getRow(study.id)
              const fields: (keyof ExtractionRow)[] = ['authorYear', 'country', 'sampleSize', 'ageGroup', 'measuresUsed', 'keyFindings']
              return (
                <tr key={study.id} className="border-t">
                  {fields.map((f) => (
                    <td key={f} className="p-1">
                      <Input
                        className="h-8 text-xs"
                        value={row[f] as string}
                        onChange={(e) => updateRow(study.id, f, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(6)}>← Back</Button>
        <Button onClick={() => setStep(8)}>Continue to Synthesis →</Button>
      </div>
    </div>
  )
}
