"use client";

import { FileQuestion, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-card p-8 rounded-2xl max-w-md">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-6 shadow-inner">
            <Icon className="h-12 w-12 text-muted-foreground animate-in zoom-in-50 duration-700" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
        )}
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
