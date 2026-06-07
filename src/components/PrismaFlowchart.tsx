import { useRef } from 'react'
import type { PrismaCounts } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import html2canvas from 'html2canvas'

interface Props {
  prisma: PrismaCounts
}

export function PrismaFlowchart({ prisma }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const exportPng = async () => {
    if (!ref.current) return
    const canvas = await html2canvas(ref.current, { scale: 3, backgroundColor: '#ffffff' })
    const link = document.createElement('a')
    link.download = 'prisma-flowchart.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const box = (label: string, count: number, sub?: string) => (
    <div className="border-2 border-primary rounded-md p-3 text-center bg-card min-w-[200px]">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold text-primary">n = {count}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  )

  const arrow = () => <div className="text-primary text-xl">↓</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={exportPng}>
          <Download className="h-4 w-4" />
          Export PNG (300 DPI)
        </Button>
      </div>
      <div ref={ref} className="flex flex-col items-center gap-2 p-6 bg-white rounded-lg">
        <h3 className="font-semibold text-lg mb-2">PRISMA Flow Diagram</h3>
        {box('Identification — Records identified', prisma.identification,
          Object.entries(prisma.perSource).map(([k, v]) => `${k}: ${v}`).join(', '))}
        {arrow()}
        {box('Duplicates removed', prisma.duplicatesRemoved)}
        {arrow()}
        {box('Screening — Records screened', prisma.recordsScreened)}
        {arrow()}
        {box('Records excluded (title/abstract)', prisma.recordsExcluded)}
        {arrow()}
        {box('Eligibility — Full-text assessed', prisma.fullTextAssessed)}
        {arrow()}
        {box('Full-text excluded', prisma.fullTextExcluded)}
        {arrow()}
        {box('Included — Studies in synthesis', prisma.studiesIncluded)}
      </div>
    </div>
  )
}
