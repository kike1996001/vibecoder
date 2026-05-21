import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
    }

    return (
      <label
        data-slot="switch"
        className="relative inline-flex items-center cursor-pointer"
      >
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors",
            isChecked
              ? "bg-primary peer-disabled:bg-primary/50"
              : "bg-muted peer-disabled:bg-muted/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform",
              isChecked && "translate-x-5"
            )}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
