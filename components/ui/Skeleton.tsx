import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shimmer rounded-md bg-noir-800",
        className
      )}
    />
  );
}

export function FilmCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-noir-800 border border-noir-700/50">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="space-y-3 p-5 bg-noir-800 rounded-xl border border-noir-700/50">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}
