import type { StudyRecord, ScreeningDecision } from '@/types/project'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  records: StudyRecord[]
  onUpdate?: (id: string, decision: ScreeningDecision, reason?: string) => void
  showScreening?: boolean
}

const decisionVariant: Record<ScreeningDecision, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  include: 'success',
  exclude: 'destructive',
  maybe: 'warning',
  pending: 'secondary',
}

const sourceColors: Record<string, string> = {
  pubmed: 'bg-blue-100 text-blue-800',
  openalex: 'bg-purple-100 text-purple-800',
  semantic_scholar: 'bg-green-100 text-green-800',
  scopus: 'bg-orange-100 text-orange-800',
  wos: 'bg-red-100 text-red-800',
  gemini_search: 'bg-amber-100 text-amber-800',
}

export function StudyTable({ records, onUpdate, showScreening = false }: Props) {
  if (records.length === 0) {
    return <p className="text-muted-foreground text-sm py-8 text-center">No studies found yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Authors</th>
            <th className="text-left p-3 font-medium">Year</th>
            <th className="text-left p-3 font-medium">Source</th>
            {showScreening && <th className="text-left p-3 font-medium">Decision</th>}
            <th className="text-left p-3 font-medium">Link</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t hover:bg-muted/50">
              <td className="p-3 max-w-xs">
                <div className="font-medium line-clamp-2">{r.title}</div>
                {r.screeningReason && (
                  <div className="text-xs text-muted-foreground mt-1">{r.screeningReason}</div>
                )}
              </td>
              <td className="p-3 text-muted-foreground">{r.authors.slice(0, 2).join(', ')}</td>
              <td className="p-3">{r.year}</td>
              <td className="p-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sourceColors[r.source] || 'bg-gray-100'}`}>
                  {r.source.replace('_', ' ')}
                </span>
              </td>
              {showScreening && (
                <td className="p-3">
                  {onUpdate ? (
                    <Select
                      value={r.screeningDecision}
                      onValueChange={(v) => onUpdate(r.id, v as ScreeningDecision)}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="include">Include</SelectItem>
                        <SelectItem value="exclude">Exclude</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={decisionVariant[r.screeningDecision]}>{r.screeningDecision}</Badge>
                  )}
                </td>
              )}
              <td className="p-3">
                {(r.url || r.doi) && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={r.url || `https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
