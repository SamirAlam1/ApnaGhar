export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-52 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 rounded-lg shimmer w-3/4" />
        <div className="h-4 rounded-lg shimmer w-1/2" />
        <div className="flex gap-4">
          <div className="h-4 rounded shimmer w-16" />
          <div className="h-4 rounded shimmer w-16" />
          <div className="h-4 rounded shimmer w-16" />
        </div>
        <div className="h-10 rounded-xl shimmer" />
      </div>
    </div>
  );
}

export function TextSkeleton({ className = 'w-full' }) {
  return <div className={`h-4 rounded shimmer ${className}`} />;
}

export function AvatarSkeleton({ size = 10 }) {
  return <div className={`w-${size} h-${size} rounded-full shimmer`} />;
}
