import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiMessageSquare, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const CommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- NEW STATES FOR EDITING ---
  const [editingId, setEditingId] = useState(null); // Tracks which comment is being edited
  const [editContent, setEditContent] = useState(""); // Tracks the typed changes
  const [editLoading, setEditLoading] = useState(false);

  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(`/comments/${videoId}`);
        setComments(response.data.data.docs || response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    };
    if (videoId) fetchComments();
  }, [videoId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitLoading(true);
    try {
      const response = await axiosInstance.post(`/comments/${videoId}`, {
        content: newComment,
      });
      setComments([response.data.data, ...comments]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- NEW EDIT FUNCTION ---
  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) return;
    setEditLoading(true);

    try {
      // Typically, MERN backends use /comments/c/:commentId for specific comment actions
      const response = await axiosInstance.patch(`/comments/c/${commentId}`, {
        content: editContent,
      });

      // Update the UI instantly by mapping over the comments array
      setComments(
        comments.map((c) => (c._id === commentId ? { ...c, content: editContent } : c))
      );
      
      setEditingId(null); // Close the edit box
      toast.success("Comment updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update comment");
    } finally {
      setEditLoading(false);
    }
  };

  // --- NEW DELETE FUNCTION ---
  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await axiosInstance.delete(`/comments/c/${commentId}`);
      // Remove it from the UI instantly
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <FiMessageSquare /> {comments.length} Comments
      </h3>

      {/* ADD COMMENT INPUT */}
      {authStatus ? (
        <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
          <img
            src={userData?.avatar}
            alt="Your Avatar"
            className="w-10 h-10 rounded-full object-cover border border-zinc-700 mt-1"
          />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors resize-none py-1 overflow-hidden"
              rows="1"
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
            {newComment.trim() && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors disabled:opacity-50"
                >
                  <FiSend /> {submitLoading ? "Posting..." : "Comment"}
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="p-4 mb-8 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-400 flex items-center justify-between">
          <p>You must be logged in to post a comment.</p>
          <a href="/login" className="text-blue-500 hover:text-blue-400 font-medium">Log In</a>
        </div>
      )}

      {/* COMMENTS LIST */}
      {loading ? (
        <div className="animate-pulse space-y-6">
           <div className="h-10 bg-zinc-800 rounded w-full"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">No comments yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => {
            // Check if the logged-in user is the owner of this specific comment
            const isOwner = userData?._id === comment.owner?._id;

            return (
              <div key={comment._id} className="flex gap-4 group">
                <img
                  src={comment.owner?.avatar || "https://via.placeholder.com/150"}
                  alt={comment.owner?.username}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                />
                
                <div className="flex-1">
                  {/* Header: Username, Date, and Action Buttons */}
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">
                        @{comment.owner?.username}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Show Edit/Delete buttons ONLY if they own the comment */}
                    {isOwner && editingId !== comment._id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3 text-zinc-400">
                        <button 
                          onClick={() => {
                            setEditingId(comment._id);
                            setEditContent(comment.content);
                          }}
                          className="hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(comment._id)}
                          className="hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body: Either show the text, or show the Edit Input */}
                  {editingId === comment._id ? (
                    <div className="mt-2 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-transparent text-white focus:outline-none resize-none"
                        rows="2"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                          <FiX /> Cancel
                        </button>
                        <button 
                          onClick={() => handleEditSubmit(comment._id)}
                          disabled={editLoading || !editContent.trim()}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50"
                        >
                          <FiCheck /> {editLoading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;