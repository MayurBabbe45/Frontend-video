import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiX, FiPlus, FiCheck } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const SaveToPlaylistModal = ({ videoId, isOpen, onClose }) => {
  const currentUser = useSelector((state) => state.auth.userData);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for creating a new playlist
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchPlaylists();
    }
  }, [isOpen, currentUser]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      // Fetch playlists using your existing backend route
      const res = await axiosInstance.get(`/playlists/user/${currentUser._id}`);
      setPlaylists(res.data.data);
    } catch (error) {
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVideo = async (playlistId, hasVideo) => {
    try {
      // Determine if we need to call ADD or REMOVE based on current state
      if (hasVideo) {
        await axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);
      } else {
        await axiosInstance.patch(`/playlists/add/${videoId}/${playlistId}`);
      }
      
      // Optimistically update the UI checkbox safely
      setPlaylists((prev) => 
        prev.map((pl) => {
          if (pl._id === playlistId) {
            // 🚨 FALLBACK APPLIED HERE: Ensure currentVideos is always an array
            const currentVideos = pl.videos || [];
            
            return {
              ...pl,
              videos: hasVideo 
                ? currentVideos.filter(id => id !== videoId && id._id !== videoId) // Remove it locally
                : [...currentVideos, { _id: videoId }] // Add dummy object safely
            };
          }
          return pl;
        })
      );
      
      toast.success(hasVideo ? "Removed from playlist" : "Added to playlist");
    } catch (error) {
      toast.error("Failed to update playlist");
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const res = await axiosInstance.post("/playlists", {
        name: newPlaylistName,
        description: "Created via Quick Save"
      });
      
      // Add the new playlist to the UI state
      const newPlaylist = res.data.data;
      setPlaylists([newPlaylist, ...playlists]);
      setNewPlaylistName("");
      setShowCreateForm(false);
      
      // Automatically add the current video to the newly created playlist
      await handleToggleVideo(newPlaylist._id, false);
      
    } catch (error) {
      toast.error("Failed to create playlist");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">Save to playlist</h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
              <FiX size={20} />
            </button>
          </div>

          {/* Playlist List */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : playlists.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No playlists yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {playlists.map((playlist) => {
                  // 🚨 FALLBACK APPLIED HERE: Safely handle undefined videos array
                  const currentVideos = playlist.videos || [];
                  const isChecked = currentVideos.some(v => v === videoId || v._id === videoId);
                  
                  return (
                    <label key={playlist._id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isChecked}
                        onChange={() => handleToggleVideo(playlist._id, isChecked)} 
                      />
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                        {isChecked && <FiCheck className="text-white text-sm" />}
                      </div>
                      <span className="text-zinc-200 group-hover:text-white transition-colors select-none">
                        {playlist.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer / Create New */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            {!showCreateForm ? (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                <FiPlus /> Create new playlist
              </button>
            ) : (
              <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Enter playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                  <button type="submit" disabled={!newPlaylistName.trim()} className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg">Create</button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SaveToPlaylistModal;