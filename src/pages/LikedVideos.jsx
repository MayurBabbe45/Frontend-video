import { useState, useEffect } from "react";
import { FiThumbsUp } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";
import VideoCard from "../components/VideoCard";

const LikedVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      
      // 🚨 Ensure this matches your actual backend route for fetching liked videos
      const res = await axiosInstance.get("/likes/videos"); 
      
      // 🚨 Mongoose Aggregation Catch: 
      // Often, the backend returns an array of "Like" documents, and the actual video 
      // details are populated inside a "video" property (e.g., item.video).
      // This map safely extracts the video object regardless of how the backend sends it.
      const videosArray = res.data.data.map(item => item.video || item);
      
      setLikedVideos(videosArray);
    } catch (err) {
      setError("Failed to load liked videos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <FiThumbsUp className="text-blue-500" /> Liked Videos
        </h1>
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3">
              <div className="w-full aspect-video bg-zinc-800 rounded-xl"></div>
              <div className="h-5 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-20 text-xl">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FiThumbsUp className="text-blue-500" /> Liked Videos
        </h1>
        <span className="text-zinc-400 font-medium px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
          {likedVideos.length} {likedVideos.length === 1 ? 'video' : 'videos'}
        </span>
      </div>

      {likedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
          <FiThumbsUp className="text-5xl mb-4 opacity-50" />
          <p className="text-xl">You haven't liked any videos yet.</p>
          <p className="text-sm mt-2">Videos you hit the like button on will show up here.</p>
          <Link to="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
            Explore Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {likedVideos.map((video) => (
            <VideoCard key={video._id} video={video} /> 
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;