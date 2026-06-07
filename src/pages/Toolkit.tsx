import { Link } from 'react-router-dom'
import { PROMPT_MODULES } from '@/prompts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export function Toolkit() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academic Toolkit</h1>
        <p className="text-muted-foreground mt-1">
          12 standalone modules for topic development, methodology, writing, and quality review.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROMPT_MODULES.map((module, i) => (
          <Link key={module.id} to={`/toolkit/${module.id}`}>
            <Card className="h-full hover:ring-2 hover:ring-primary transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">Module {i + 1}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{module.fields.length} input fields</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
