import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiFolder, FiPlay, FiList } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";

const Playlists = () => {
  const currentUser = useSelector((state) => state.auth.userData);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/playlists/user/${currentUser._id}`);
        setPlaylists(res.data.data);
      } catch (err) {
        setError("Failed to load your playlists.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <FiFolder className="text-blue-500" /> My Playlists
        </h1>
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
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <FiFolder className="text-blue-500" /> My Playlists
      </h1>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
          <FiFolder className="text-5xl mb-4 opacity-50" />
          <p className="text-xl">You haven't created any playlists yet.</p>
          <p className="text-sm mt-2">Click "Save" on any video to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => {
            // Grab the thumbnail of the first video, or use a default dark placeholder
            const coverImage = playlist.videos?.[0]?.thumbnail;
            
            return (
              <Link 
                key={playlist._id} 
                to={`/playlist/${playlist._id}`} // We will build this detail page next!
                className="group flex flex-col gap-3 cursor-pointer"
              >
                {/* Playlist Cover / Thumbnail */}
                <div className="relative w-full aspect-video bg-zinc-800 rounded-xl overflow-hidden border border-zinc-800 group-hover:border-blue-500 transition-colors">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={playlist.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <FiFolder className="text-zinc-600 text-4xl" />
                    </div>
                  )}
                  
                  {/* Overlay showing video count */}
                  <div className="absolute right-2 bottom-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <FiList /> {playlist.totalVideos} videos
                  </div>

                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center pl-1 text-white shadow-lg">
                      <FiPlay size={20} />
                    </div>
                  </div>
                </div>

                {/* Playlist Info */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {playlist.description || "No description"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Playlists;