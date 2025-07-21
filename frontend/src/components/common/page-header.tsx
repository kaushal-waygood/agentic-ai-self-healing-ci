import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-7 w-7 text-primary hidden sm:block" />}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 mt-2 md:mt-0">{actions}</div>}
      </div>
    </div>
  );
}
