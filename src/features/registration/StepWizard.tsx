import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { WizardStep } from './types'

export interface StepWizardProps {
  steps: readonly WizardStep[]
  currentStep: number
  onBack: () => void
  onNext: () => void
  onSubmit?: () => void
  isFirstStep?: boolean
  isLastStep?: boolean
  isSubmitting?: boolean
  nextDisabled?: boolean
  children: ReactNode
  className?: string
}

export function StepWizard({
  steps,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  isFirstStep,
  isLastStep,
  isSubmitting,
  nextDisabled,
  children,
  className,
}: StepWizardProps) {
  const progress = ((currentStep + 1) / steps.length) * 100
  const activeStep = steps[currentStep]

  return (
    <div className={cn('space-y-8', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">{activeStep?.label}</span>
        </div>
        <Progress value={progress} aria-label="Registration progress" />
        <ol className="hidden gap-2 sm:flex">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs',
                index === currentStep && 'border-primary bg-primary/5 text-primary',
                index < currentStep && 'border-primary/30 text-primary',
                index > currentStep && 'text-muted-foreground',
              )}
              aria-current={index === currentStep ? 'step' : undefined}
            >
              <span className="font-medium">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="min-h-[320px]">{children}</div>

      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {isLastStep ? (
          <Button type="button" onClick={onSubmit} disabled={isSubmitting || nextDisabled}>
            {isSubmitting ? 'Submitting…' : 'Complete Registration'}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={nextDisabled}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
