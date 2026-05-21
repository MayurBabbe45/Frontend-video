import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUploadCloud, FiUser, FiMail, FiLock, FiAtSign } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [files, setFiles] = useState({ avatar: null, coverImage: null });
  const [previews, setPreviews] = useState({ avatar: null, coverImage: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    
    if (file) {
      // 🚨 FIX 1: Use the 'prev' state pattern to ensure we don't overwrite 
      // the avatar when uploading the cover image!
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!files.avatar) {
      toast.error("Avatar image is required!");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating your account... Uploading media...");

    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("username", formData.username.toLowerCase());
      data.append("email", formData.email);
      data.append("password", formData.password);
      
      // Append the actual files from state
      data.append("avatar", files.avatar); 
      
      if (files.coverImage) {
        data.append("coverImage", files.coverImage);
      }

      // ✅ Let Axios handle the headers and boundaries automatically
      const response = await axiosInstance.post("/users/register", data);

      toast.success("Account created successfully!", { id: loadingToast });
      navigate("/login"); 

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-xl w-full bg-[#1f1f1f] border border-zinc-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Join the Platform</h2>
          <p className="text-gray-400 mt-2">Create your creator profile</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* --- FILE UPLOAD SECTION --- */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center p-4 bg-[#141414] rounded-xl border border-zinc-800/50">
            
            {/* Avatar Upload (Required) */}
            <div className="relative group cursor-pointer flex flex-col items-center">
              <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} className="hidden" id="avatarUpload" />
              <label htmlFor="avatarUpload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors relative">
                  {previews.avatar ? (
                    <img src={previews.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiUploadCloud className="text-3xl text-zinc-500 group-hover:text-blue-500 transition-colors" />
                  )}
                </div>
                <span className="text-xs text-zinc-400 font-medium">Avatar *</span>
              </label>
            </div>

            {/* Cover Image Upload (Optional) */}
            <div className="relative group cursor-pointer flex flex-col items-center flex-1 w-full">
              <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} className="hidden" id="coverUpload" />
              <label htmlFor="coverUpload" className="cursor-pointer w-full flex flex-col items-center gap-2">
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-zinc-600 flex items-center justify-center overflow-hidden hover:border-purple-500 transition-colors relative">
                  {previews.coverImage ? (
                    <img src={previews.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-500 group-hover:text-purple-500 transition-colors flex items-center gap-2">
                      <FiUploadCloud className="text-xl" /> Cover Image (Optional)
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* --- TEXT INPUT SECTION --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Full Name" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div className="relative">
              <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Username" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Profile..." : "Create Account"}
          </motion.button>
        </form>

        <p className="text-center text-zinc-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;