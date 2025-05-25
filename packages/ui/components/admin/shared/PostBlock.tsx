import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@ui/components/ui/card"
import { GripVertical } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@ui/components/ui/accordion"
import { cn } from "@ui/lib/utils"

interface PostBlockProps {
  id: string
  children: React.ReactNode
  className?: string
  title?: string
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PostBlock({
  id,
  children,
  className,
  title,
  dragHandleProps,
  open,
  defaultOpen = true,
  onOpenChange
}: PostBlockProps) {
  // Controlled/uncontrolled open state
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isOpen = open !== undefined ? open : internalOpen

  const handleOpenChange = (value: boolean) => {
    if (open === undefined) setInternalOpen(value)
    onOpenChange?.(value)
  }

  return (
    <Accordion
      type="single"
      collapsible
      className={className}
      value={isOpen ? id : undefined}
      onValueChange={v => handleOpenChange(!!v)}
    >
      <AccordionItem value={id}>
        <Card data-block-id={id} className="p-0 gap-0">
          <CardHeader className="flex flex-row items-center gap-2">
            <span
              className="text-muted-foreground cursor-grab"
              {...dragHandleProps}
              tabIndex={0}
              aria-label="Drag block"
            >
              <GripVertical className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <AccordionTrigger type="button">
                <span>{title}</span>
              </AccordionTrigger>
            </div>
          </CardHeader>
          <AccordionContent>
            <CardContent className="p-4">
              {children}
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  )
}
