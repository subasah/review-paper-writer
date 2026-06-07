import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { StudyTable } from '@/components/StudyTable'
import { Loader2 } from 'lucide-react'
import type { DatabaseSource } from '@/types/project'

const DATABASES: { id: DatabaseSource; label: string; free: boolean }[] = [
  { id: 'pubmed', label: 'PubMed', free: true },
  { id: 'openalex', label: 'OpenAlex', free: true },
  { id: 'semantic_scholar', label: 'Semantic Scholar', free: true },
  { id: 'scopus', label: 'Scopus', free: false },
  { id: 'wos', label: 'Web of Science', free: false },
  { id: 'gemini_search', label: 'Web Search (Gemini)', free: true },
]

export function Step3DatabaseSearch() {
  const { activeProject, updateProject, addRecords, setStep } = useProjectStore()
  const [loading, setLoading] = useState(false)

  if (!activeProject) return null
  const p = activeProject
  const currentYear = new Date().getFullYear()

  const toggleDb = (db: DatabaseSource) => {
    const dbs = p.config.databases.includes(db)
      ? p.config.databases.filter((d) => d !== db)
      : [...p.config.databases, db]
    updateProject({ config: { ...p.config, databases: dbs } })
  }

  const runSearch = async () => {
    setLoading(true)
    try {
      const yearFrom = currentYear - p.config.searchRadiusYears
      const yearTo = currentYear

      if (p.config.databases.includes('gemini_search')) {
        const otherDbs = p.config.databases.filter((d) => d !== 'gemini_search')
        if (otherDbs.length > 0) {
          const res = await api.search({
            booleanQuery: p.searchStrategy.booleanQuery,
            databases: otherDbs,
            yearFrom,
            yearTo,
            maxResults: 50,
          })
          await addRecords(res.records, res.perSource)
        }
        const gemRes = await api.searchGrounded(p.searchStrategy.booleanQuery, yearFrom, yearTo)
        await addRecords(gemRes.records, gemRes.perSource)
      } else {
        const res = await api.search({
          booleanQuery: p.searchStrategy.booleanQuery,
          databases: p.config.databases,
          yearFrom,
          yearTo,
          maxResults: 50,
        })
        await addRecords(res.records, res.perSource)
      }

      await updateProject({
        config: { ...p.config, yearRange: { from: yearFrom, to: yearTo } },
      })
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Search Radius: {p.config.searchRadiusYears} years back</Label>
        <Slider
          className="mt-2"
          value={[p.config.searchRadiusYears]}
          onValueChange={([v]) => updateProject({ config: { ...p.config, searchRadiusYears: v } })}
          min={1}
          max={50}
          step={1}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Searching {currentYear - p.config.searchRadiusYears} – {currentYear}
        </p>
      </div>

      <div>
        <Label className="mb-2 block">Databases</Label>
        <div className="flex flex-wrap gap-2">
          {DATABASES.map(({ id, label, free }) => (
            <Button
              key={id}
              variant={p.config.databases.includes(id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleDb(id)}
            >
              {label} {!free && '(key)'}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={runSearch} disabled={loading || p.config.databases.length === 0}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Run Search
        </Button>
        <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
        <Button onClick={() => setStep(4)} disabled={p.records.length === 0}>Continue →</Button>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Found {p.records.length} unique records ({p.prisma.duplicatesRemoved} duplicates removed)
        </p>
        <StudyTable records={p.records} />
      </div>
    </div>
  )
}
