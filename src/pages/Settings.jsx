import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiUploadCloud, FiLock, FiUser, FiMail, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
// Adjust this import based on your actual auth slice path and actions
import { login } from "../store/authSlice"; 

const Settings = () => {
  const currentUser = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  // --- STATE: Account Details ---
  const [accountData, setAccountData] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
  });
  const [updatingAccount, setUpdatingAccount] = useState(false);

  // --- STATE: Passwords ---
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // --- STATE: Images ---
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [updatingCover, setUpdatingCover] = useState(false);

  // 1. Handle Account Details Update
  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdatingAccount(true);
      const res = await axiosInstance.patch("/users/update-account", accountData);
      
      // Update global state so the navbar reflects the new name!
      dispatch(login(res.data.data)); 
      toast.success("Account details updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update account");
    } finally {
      setUpdatingAccount(false);
    }
  };

  // 2. Handle Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    try {
      setUpdatingPassword(true);
      await axiosInstance.post("/users/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" }); // clear form
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 3. Handle Avatar Update
  const handleAvatarUpdate = async () => {
    if (!avatarFile) return toast.error("Please select an image first");
    try {
      setUpdatingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await axiosInstance.patch("/users/avatar", formData);
      dispatch(login(res.data.data)); // Update Redux state with new avatar URL
      setAvatarFile(null);
      toast.success("Avatar updated! It may take a moment to reflect everywhere.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update avatar");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  // 4. Handle Cover Image Update
  const handleCoverUpdate = async () => {
    if (!coverFile) return toast.error("Please select an image first");
    try {
      setUpdatingCover(true);
      const formData = new FormData();
      formData.append("coverImage", coverFile);

      const res = await axiosInstance.patch("/users/cover-image", formData);
      dispatch(login(res.data.data)); // Update Redux state
      setCoverFile(null);
      toast.success("Cover image updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update cover image");
    } finally {
      setUpdatingCover(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 w-full min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="flex flex-col gap-8">
        
        {/* --- SECTION 1: PROFILE DETAILS --- */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiUser className="text-blue-500" /> Personal Information
          </h2>
          <form onSubmit={handleAccountUpdate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={accountData.fullName}
                  onChange={(e) => setAccountData({...accountData, fullName: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Email</label>
                <input 
                  type="email" 
                  value={accountData.email}
                  onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <button 
              disabled={updatingAccount}
              type="submit" 
              className="self-end px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {updatingAccount ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* --- SECTION 2: CHANNEL IMAGES --- */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiImage className="text-purple-500" /> Channel Images
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Avatar */}
            <div className="flex flex-col gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <span className="text-sm font-medium text-zinc-300">Profile Avatar</span>
              <div className="flex items-center gap-4">
                <img src={currentUser?.avatar} alt="Current Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700" />
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer" />
              </div>
              <button onClick={handleAvatarUpdate} disabled={updatingAvatar || !avatarFile} className="mt-2 w-full py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium disabled:opacity-50 transition-colors">
                {updatingAvatar ? "Uploading..." : "Update Avatar"}
              </button>
            </div>

            {/* Cover Image */}
            <div className="flex flex-col gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <span className="text-sm font-medium text-zinc-300">Cover Banner</span>
              <div className="flex flex-col gap-2">
                {currentUser?.coverImage ? (
                   <img src={currentUser?.coverImage} alt="Cover" className="w-full h-16 rounded-lg object-cover border-2 border-zinc-700" />
                ) : (
                  <div className="w-full h-16 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500 border-2 border-zinc-700">No cover image</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer" />
              </div>
              <button onClick={handleCoverUpdate} disabled={updatingCover || !coverFile} className="mt-2 w-full py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium disabled:opacity-50 transition-colors">
                {updatingCover ? "Uploading..." : "Update Cover"}
              </button>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: SECURITY --- */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiLock className="text-red-500" /> Security
          </h2>
          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Old Password</label>
                <input type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">New Password</label>
                <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Confirm New Password</label>
                <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:border-red-500 outline-none" />
              </div>
            </div>
            <button 
              disabled={updatingPassword}
              type="submit" 
              className="self-end px-6 py-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {updatingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;