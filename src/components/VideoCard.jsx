import { Link } from "react-router-dom";
// Optional: If you want to format dates like "2 days ago", you can install 'date-fns' or 'dayjs' later. 
// For now, we will do a simple date display.

const VideoCard = ({ video }) => {
  return (
    <Link to={`/video/${video._id}`} className="flex flex-col gap-3 group cursor-pointer">
      
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Optional Duration Badge (If your backend saved duration from Cloudinary) */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
            {Math.round(video.duration)}s
          </span>
        )}
      </div>

      {/* Video Info */}
      <div className="flex gap-3 pr-4">
        {/* Channel Avatar */}
        <Link to={`/c/${video.owner?.username}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <img 
            src={video.owner?.avatar || "https://via.placeholder.com/150"} 
            alt="Channel Avatar" 
            className="w-10 h-10 rounded-full object-cover border border-zinc-800"
          />
        </Link>

        {/* Text Details */}
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-white font-semibold text-base line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          <span className="text-zinc-400 text-sm mt-1 hover:text-white transition-colors">
            {video.owner?.fullName || video.owner?.username || "Unknown Creator"}
          </span>
          <div className="flex items-center text-zinc-400 text-sm">
            <span>{video.views} views</span>
            <span className="mx-1">•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
    </Link>
  );
};

export default VideoCard;