import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/VideoCard";
import { FiAlertCircle } from "react-icons/fi";
import VideoCardSkeleton from "../components/VideoCardSkeleton";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // Assuming your backend route to get all videos is GET /api/v1/videos
        const response = await axiosInstance.get("/videos");
        
        // Log this to see exactly what your backend sends!
        console.log("Fetched Videos:", response.data); 
        
        // Extract the array of videos from your ApiResponse object
        setVideos(response.data.data.docs || response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {/* Create a quick array of 8 items and map over it to render 8 skeletons */}
          {[...Array(8)].map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
        <FiAlertCircle className="text-5xl text-red-500/50" />
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <p className="text-xl">No videos found. Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Responsive Grid: 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Home;