const VideoCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 w-full animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-zinc-800 rounded-xl"></div>

      {/* Info Skeleton */}
      <div className="flex gap-3 pr-4">
        {/* Avatar Skeleton */}
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0"></div>

        {/* Text Skeleton */}
        <div className="flex flex-col gap-2 w-full mt-1">
          <div className="h-4 bg-zinc-800 rounded w-[90%]"></div>
          <div className="h-4 bg-zinc-800 rounded w-[60%]"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;