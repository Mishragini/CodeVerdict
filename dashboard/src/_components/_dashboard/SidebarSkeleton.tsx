import { Skeleton } from "@/components/ui/skeleton";
export function SidebarSkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 p-6">
      {Array.from({ length: 20 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
