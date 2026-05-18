import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiPlay, FiTrash2, FiVideo } from "react-icons/fi";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const currentUser = useSelector((state) => state.auth.userData);
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/playlists/${playlistId}`);
        setPlaylist(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  const handleRemoveVideo = async (videoId) => {
    try {
      // Hit your existing remove endpoint
      await axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);
      
      // Optimistically remove it from the UI without reloading
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      toast.success("Video removed from playlist");
    } catch (error) {
      toast.error("Failed to remove video");
    }
  };

  // Helper function to format duration (e.g., 125 seconds -> "2:05")
  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full mt-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !playlist) {
    return <div className="text-center text-red-500 mt-20 text-xl">{error || "Playlist not found"}</div>;
  }

  // Check if the current user owns this playlist so we can show/hide the "Delete" buttons
  const isOwner = currentUser?.username === playlist.ownerDetails?.username;
  const coverImage = playlist.videos?.[0]?.thumbnail;
  const totalViews = playlist.videos?.reduce((acc, video) => acc + video.views, 0) || 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* --- LEFT COLUMN: Playlist Details (Sticky on desktop) --- */}
      <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
          <div className="w-full aspect-video bg-zinc-800 rounded-xl overflow-hidden mb-6 shadow-lg">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiVideo className="text-zinc-600 text-5xl" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{playlist.name}</h1>
          
          <Link to={`/c/${playlist.ownerDetails?.username}`} className="font-medium text-zinc-300 hover:text-white transition-colors">
            {playlist.ownerDetails?.fullName || playlist.ownerDetails?.username}
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mt-4 mb-6 uppercase tracking-wider">
            <span>{playlist.videos?.length || 0} videos</span>
            <span>•</span>
            <span>{totalViews} views</span>
          </div>

          <p className="text-sm text-zinc-400 mb-6 line-clamp-3">
            {playlist.description || "No description provided."}
          </p>

          {playlist.videos?.length > 0 && (
            <Link 
              to={`/video/${playlist.videos[0]._id}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-zinc-200 text-black rounded-full font-bold transition-colors"
            >
              <FiPlay className="fill-black" /> Play All
            </Link>
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: Video List --- */}
      <div className="flex-1 flex flex-col gap-3">
        {playlist.videos?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
            <FiVideo className="text-5xl mb-4 opacity-50" />
            <p className="text-xl">This playlist is empty.</p>
          </div>
        ) : (
          playlist.videos.map((video, index) => (
            <div key={video._id} className="group flex items-start gap-4 p-3 hover:bg-zinc-900 rounded-xl transition-colors border border-transparent hover:border-zinc-800 relative">
              
              <span className="text-zinc-500 font-medium w-6 text-center mt-auto mb-auto hidden sm:block">
                {index + 1}
              </span>

              <Link to={`/video/${video._id}`} className="relative w-40 aspect-video bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </span>
              </Link>

              <div className="flex-1 min-w-0 py-1">
                <Link to={`/video/${video._id}`}>
                  <h3 className="text-white font-medium text-lg leading-tight mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                </Link>
                <Link to={`/c/${playlist.ownerDetails?.username}`} className="text-sm text-zinc-400 hover:text-white transition-colors">
                  {playlist.ownerDetails?.fullName}
                </Link>
                <p className="text-xs text-zinc-500 mt-1">
                  {video.views} views
                </p>
              </div>

              {/* Remove Video Button (Only visible if the user owns the playlist) */}
              {isOwner && (
                <button 
                  onClick={() => handleRemoveVideo(video._id)}
                  title="Remove from playlist"
                  className="p-2 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default PlaylistDetail;