import {  XCircle } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export const ErrorState = ({ title, description }: Props) => {
  return (
    <div className="w-full h-full flex items-center justify-center py-10">
      <div className="flex items-center gap-4">
        <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />

        <div className="flex flex-col">
          <h6 className="text-base font-semibold text-red-600 dark:text-red-400">
            {title}
          </h6>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};
