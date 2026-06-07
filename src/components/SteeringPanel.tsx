import type { SteeringConfig, WizardStep } from '@/types/project'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Props {
  steering: SteeringConfig
  onChange: (updates: Partial<SteeringConfig>) => void
}

export function SteeringPanel({ steering, onChange }: Props) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-base">Steering Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>Finding Emphasis</Label>
          <Select
            value={steering.findingEmphasis}
            onValueChange={(v) => onChange({ findingEmphasis: v as SteeringConfig['findingEmphasis'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supportive">Supportive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Inclusion Strictness: {steering.inclusionStrictness}%</Label>
          <Slider
            className="mt-2"
            value={[steering.inclusionStrictness]}
            onValueChange={([v]) => onChange({ inclusionStrictness: v })}
            max={100}
            step={5}
          />
        </div>

        <div>
          <Label>Synthesis Focus</Label>
          <Select
            value={steering.synthesisFocus}
            onValueChange={(v) => onChange({ synthesisFocus: v as SteeringConfig['synthesisFocus'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="population">Population gaps</SelectItem>
              <SelectItem value="methodology">Methodology</SelectItem>
              <SelectItem value="theory">Theory</SelectItem>
              <SelectItem value="practical">Practical application</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Word Limit</Label>
          <Input
            type="number"
            className="mt-1"
            value={steering.wordLimit}
            onChange={(e) => onChange({ wordLimit: parseInt(e.target.value) || 5000 })}
            min={2500}
            max={6500}
          />
        </div>

        <div>
          <Label className="mb-2 block">Team Assignments (2 people)</Label>
          <div className="space-y-2 text-xs">
            {([5, 6, 7, 8] as WizardStep[]).map((step) => (
              <div key={step} className="flex items-center justify-between">
                <span>Step {step}</span>
                <Select
                  value={steering.teamAssignments[step]}
                  onValueChange={(v) =>
                    onChange({
                      teamAssignments: {
                        ...steering.teamAssignments,
                        [step]: v as 'personA' | 'personB' | 'both',
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personA">Person A</SelectItem>
                    <SelectItem value="personB">Person B</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
