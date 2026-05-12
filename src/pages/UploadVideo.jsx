import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiVideo, FiImage, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const UploadVideo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Text data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // File data
  const [files, setFiles] = useState({
    videoFile: null,
    thumbnail: null,
  });

  // Previews for UX
  const [previews, setPreviews] = useState({
    videoName: "",
    thumbnailUrl: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name; // 'videoFile' or 'thumbnail'

    if (file) {
      setFiles({ ...files, [name]: file });

      if (name === "thumbnail") {
        setPreviews({ ...previews, thumbnailUrl: URL.createObjectURL(file) });
      } else if (name === "videoFile") {
        setPreviews({ ...previews, videoName: file.name });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.videoFile || !files.thumbnail) {
      toast.error("Both a video file and a thumbnail are required!");
      return;
    }

    setLoading(true);
    // Cloudinary video uploads can take 10-30 seconds depending on file size.
    const uploadToast = toast.loading("Uploading to Cloudinary... Please do not close this page.");

    try {
      // 🚨 CRITICAL: Construct FormData for multer to read
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("videoFile", files.videoFile);
      data.append("thumbnail", files.thumbnail);

      const response = await axiosInstance.post("/videos", data);

      toast.success("Video published successfully!", { id: uploadToast });
      
      // Navigate to the newly created video page!
      navigate(`/video/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload video", { id: uploadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FiUploadCloud className="text-blue-500" /> Upload Video
        </h1>
        <p className="text-zinc-400 mt-2">Publish your content to the world</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#1f1f1f] p-6 rounded-2xl border border-zinc-800 shadow-xl">
        
        {/* --- FILE UPLOAD ZONES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Video Upload Box */}
          <div className="relative group">
            <input 
              type="file" 
              name="videoFile" 
              accept="video/*" 
              onChange={handleFileChange} 
              className="hidden" 
              id="videoUpload" 
            />
            <label 
              htmlFor="videoUpload" 
              className={`cursor-pointer flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl transition-colors ${files.videoFile ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-blue-500 bg-zinc-900/50'}`}
            >
              {files.videoFile ? (
                <div className="text-center text-blue-500 flex flex-col items-center gap-2">
                  <FiCheckCircle className="text-4xl" />
                  <span className="font-medium px-4 text-center line-clamp-1">{previews.videoName}</span>
                  <span className="text-xs text-zinc-400">Click to change video</span>
                </div>
              ) : (
                <div className="text-center text-zinc-400 group-hover:text-blue-400 flex flex-col items-center gap-2 transition-colors">
                  <FiVideo className="text-4xl" />
                  <span className="font-medium">Select Video File *</span>
                  <span className="text-xs text-zinc-500">MP4, WebM, or OGG</span>
                </div>
              )}
            </label>
          </div>

          {/* Thumbnail Upload Box */}
          <div className="relative group">
            <input 
              type="file" 
              name="thumbnail" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
              id="thumbnailUpload" 
            />
            <label 
              htmlFor="thumbnailUpload" 
              className={`cursor-pointer flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl overflow-hidden transition-colors ${files.thumbnail ? 'border-blue-500' : 'border-zinc-700 hover:border-blue-500 bg-zinc-900/50'}`}
            >
              {previews.thumbnailUrl ? (
                <div className="w-full h-full relative">
                  <img src={previews.thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white font-medium">
                    Change Thumbnail
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-400 group-hover:text-blue-400 flex flex-col items-center gap-2 transition-colors">
                  <FiImage className="text-4xl" />
                  <span className="font-medium">Upload Thumbnail *</span>
                  <span className="text-xs text-zinc-500">JPG, PNG, or WEBP</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* --- TEXT INPUTS --- */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Video Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Give your video a catchy title"
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Tell viewers about your video..."
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* --- SUBMIT BUTTON --- */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </>
            ) : (
              "Publish Video"
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default UploadVideo;