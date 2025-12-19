import { Loader2Icon } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export const LoadingState = ({ title, description }: Props) => {
  return (
    <div className="w-full h-full flex items-center justify-center py-10">
      <div className="flex items-center gap-4">
        <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground" />

        <div className="flex flex-col">
          <h6 className="text-base font-medium">{title}</h6>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};
