import { WIZARD_STEPS } from '@/types/project'
import type { WizardStep } from '@/types/project'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Props {
  currentStep: WizardStep
  onStepClick?: (step: WizardStep) => void
}

export function WizardNav({ currentStep, onStepClick }: Props) {
  return (
    <nav className="flex flex-wrap gap-2 mb-6">
      {WIZARD_STEPS.map(({ step, title }) => {
        const done = step < currentStep
        const active = step === currentStep
        return (
          <button
            key={step}
            onClick={() => onStepClick?.(step as WizardStep)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors border',
              active && 'bg-primary text-primary-foreground border-primary',
              done && !active && 'bg-accent text-accent-foreground border-accent',
              !active && !done && 'bg-card text-muted-foreground border-border hover:bg-muted'
            )}
          >
            <span className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-xs',
              active ? 'bg-primary-foreground text-primary' : done ? 'bg-green-600 text-white' : 'bg-muted'
            )}>
              {done ? <Check className="h-3 w-3" /> : step}
            </span>
            <span className="hidden sm:inline">{title}</span>
          </button>
        )
      })}
    </nav>
  )
}
