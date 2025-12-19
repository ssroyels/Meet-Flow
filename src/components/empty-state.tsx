import Image from "next/image";

interface Props {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: Props) => {
  return (
    <div className="w-full h-full flex items-center justify-center py-10">
     
   <Image src="/empty.svg" alt="Empty" width={240} height={240}/>

        <div className="flex flex-col ">
          <h6 className="text-base font-semibold text-red-600 dark:text-red-400">
            {title}
          </h6>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
   
  );
};
