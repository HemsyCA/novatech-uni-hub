import { Check, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrackerStep {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface StatusTrackerProps {
  steps: TrackerStep[];
  currentKey: string;
  cancelledKey?: string;
  className?: string;
}

export function StatusTracker({ steps, currentKey, cancelledKey = "cancelled", className }: StatusTrackerProps) {
  if (currentKey === cancelledKey) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <X className="h-4 w-4" />
        <span>Cancelado</span>
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === currentKey)
  );

  return (
    <div className={cn("flex items-start", className)}>
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 w-16">
              <div
                className={cn(
                  "w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors",
                  isDone && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary bg-primary/10 animate-pulse",
                  !isDone && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  "text-[10px] text-center leading-tight",
                  isDone || isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("flex-1 h-0.5 mt-4 mx-0.5", isDone ? "bg-primary" : "bg-border")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
