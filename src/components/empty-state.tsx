import Image from "next/image";
import { ReactNode } from "react";

interface Props {
  title: string;
  description: ReactNode;   // ✅ JSX / HTML allowed
  action?: ReactNode;       // ✅ optional action (Button / Link / etc.)
}

export const EmptyState = ({ title, description, action }: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-10 text-center">
      {/* Illustration */}
      <Image
        src="/empty.svg"
        alt="Empty state"
        width={240}
        height={240}
        priority
      />

      {/* Content */}
      <div className="flex flex-col items-center gap-2 mt-4 max-w-md">
        <h6 className="text-base font-semibold text-foreground">
          {title}
        </h6>

        <div className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </div>

        {/* Optional Action */}
        {action && (
          <div className="pt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
