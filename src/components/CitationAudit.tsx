import type { ManuscriptSections, Citation, StudyRecord } from '@/types/project'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface Props {
  manuscript: ManuscriptSections
  citations: Citation[]
  records: StudyRecord[]
}

function extractCitationRefs(text: string): string[] {
  const matches = text.match(/\[([^\]]+,\s*\d{4})\]/g) || []
  return matches.map((m) => m.slice(1, -1))
}

export function CitationAudit({ manuscript, citations, records }: Props) {
  const sections = [
    manuscript.abstract,
    manuscript.introduction,
    manuscript.methods,
    manuscript.results,
    manuscript.discussion,
    manuscript.conclusions,
  ]

  const allRefs = sections.flatMap((s) => extractCitationRefs(s.content))
  const recordRefs = records.map((r) => `${r.authors[0]?.split(' ').pop() || 'Unknown'}, ${r.year}`)
  const unverified = allRefs.filter((ref) => !recordRefs.some((rr) => rr.toLowerCase().includes(ref.toLowerCase().split(',')[0])))

  const uncitedSections = sections.filter((s) => s.content.length > 100 && extractCitationRefs(s.content).length === 0)

  const canExport = unverified.length === 0 && uncitedSections.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {canExport ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
          Citation Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 text-sm">
          <span>Citations in text: <strong>{allRefs.length}</strong></span>
          <span>Studies available: <strong>{records.length}</strong></span>
          <span>Registered citations: <strong>{citations.length}</strong></span>
        </div>

        {unverified.length > 0 && (
          <div>
            <p className="text-sm font-medium text-destructive mb-2">Unverified citations ({unverified.length})</p>
            <div className="flex flex-wrap gap-1">
              {unverified.map((ref) => (
                <Badge key={ref} variant="destructive">{ref}</Badge>
              ))}
            </div>
          </div>
        )}

        {uncitedSections.length > 0 && (
          <div>
            <p className="text-sm font-medium text-amber-600 mb-2">Sections lacking citations</p>
            {uncitedSections.map((s) => (
              <Badge key={s.id} variant="warning" className="mr-1">{s.title}</Badge>
            ))}
          </div>
        )}

        {canExport ? (
          <p className="text-sm text-green-700">All claims appear backed by retrieved studies. Export enabled.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Resolve unverified citations before exporting the manuscript.</p>
        )}
      </CardContent>
    </Card>
  )
}
