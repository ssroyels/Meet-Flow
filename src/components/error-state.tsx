import { ReactNode } from "react";
import { XCircle } from "lucide-react";

interface Props {
  title: string;
  description: ReactNode;
  action?: ReactNode; // ✅ JSX allowed
}

export const ErrorState = ({ title, description, action }: Props) => {
  return (
    <div className="w-full h-full flex items-center justify-center py-10">
      <div className="flex items-start gap-4 max-w-md">
        <XCircle className="w-8 h-8 text-red-500 dark:text-red-400 shrink-0 mt-1" />

        <div className="flex flex-col gap-2 w-full">
          <h6 className="text-base font-semibold text-red-600 dark:text-red-400">
            {title}
          </h6>

          <div className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </div>

          {action && <div className="pt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
};
