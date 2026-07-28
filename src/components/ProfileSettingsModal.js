import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Loader2, Eye, Upload, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const names = user.displayName ? user.displayName.split(' ') : ['', ''];
      setFirstName(user.firstName || names[0] || '');
      setLastName(user.lastName || names[1] || '');
      setPhone(user.phone || '');
      setAvatar(user.profileImage || '');
    }
  }, [isOpen, user]);

  // Handle escape key to close (respecting active sub-modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showPhotoViewer) {
          setShowPhotoViewer(false);
        } else if (showConfirmDelete) {
          setShowConfirmDelete(false);
        } else if (showAvatarMenu) {
          setShowAvatarMenu(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, showPhotoViewer, showConfirmDelete, showAvatarMenu]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    setShowAvatarMenu(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10 MB.');
      return;
    }

    // Validate image format
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF and WebP images are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const loadingToast = toast.loading('Uploading avatar...');

    try {
      const updatedUser = await api.uploadAvatar(formData);
      localStorage.setItem('eventdeco_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatar(updatedUser.profileImage);
      toast.dismiss(loadingToast);
      toast.success('Avatar uploaded successfully!');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to upload avatar');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error('First Name is required');
      return;
    }
    
    setSaving(true);
    try {
      const updatedUser = await api.updateCurrentUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        profileImage: avatar,
      });
      
      localStorage.setItem('eventdeco_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile details saved successfully!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save profile changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return (f + l).toUpperCase() || 'U';
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto pt-28 sm:pt-36 pb-10 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-md bg-[#0a0d21] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col text-white animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <h2 id="modal-title" className="text-xl font-bold text-white tracking-wide">
            Account Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 mt-6 space-y-6 scrollbar-hide">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 duration-300">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black font-extrabold text-3xl tracking-wider">
                    {getInitials()}
                  </span>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full duration-300">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
            </div>
            <button 
              type="button"
              onClick={handleAvatarClick}
              className="text-xs text-slate-400 hover:text-amber-500 font-semibold transition-colors cursor-pointer mt-1 hover:underline"
            >
              Manage profile picture
            </button>
          </div>

          {/* Details Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                className="w-full bg-white/2 border border-white/5 rounded-xl px-4 py-2 text-slate-400 text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-500 mt-1">Email address is your account ID and cannot be modified.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent border border-white/20 hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-sm shadow-md shadow-amber-500/10 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Avatar Options Dialog/Bottom-sheet */}
      {showAvatarMenu && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowAvatarMenu(false);
          }}
        >
          <div 
            className="w-full max-w-xs bg-[#0b0e26] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-slate-200">Profile Photo</h3>
              <button 
                type="button"
                onClick={() => setShowAvatarMenu(false)}
                className="p-1 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              {avatar && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoViewer(true);
                    setShowAvatarMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 hover:bg-white/5 active:bg-white/10 rounded-xl text-xs font-semibold transition-all text-left group cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-3 text-amber-500 group-hover:scale-110 transition-transform" />
                  View Photo
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowAvatarMenu(false);
                }}
                className="w-full flex items-center px-4 py-2.5 hover:bg-white/5 active:bg-white/10 rounded-xl text-xs font-semibold transition-all text-left group cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                {avatar ? 'Change Photo' : 'Upload Photo'}
              </button>
              
              {avatar && (
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDelete(true);
                    setShowAvatarMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 rounded-xl text-xs font-semibold text-red-400 transition-all text-left group cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                  Remove Photo
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAvatarMenu(false)}
              className="w-full py-2 bg-transparent border border-white/15 hover:bg-white/5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog before permanent removal */}
      {showConfirmDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmDelete(false);
          }}
        >
          <div 
            className="w-full max-w-xs bg-[#0b0e26] border border-red-500/20 rounded-2xl p-5 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 mb-1">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Remove Photo?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove your profile picture? Click Save Changes afterwards to save it permanently.
              </p>
            </div>
            
            <div className="flex space-x-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2 bg-transparent border border-white/15 hover:bg-white/5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatar('');
                  setShowConfirmDelete(false);
                  toast.success('Profile picture queued for removal. Click Save Changes to save.');
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Viewer */}
      {showPhotoViewer && (
        <div 
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowPhotoViewer(false);
          }}
        >
          <button
            type="button"
            onClick={() => setShowPhotoViewer(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full text-white transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative max-w-full max-h-[80vh] overflow-hidden rounded-xl border border-white/10 shadow-2xl flex items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={avatar} 
              alt="Profile Large Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl select-none"
            />
          </div>
          <p className="text-slate-400 text-xs mt-4 select-none">Profile Photo Preview</p>
        </div>
      )}

    </div>,
    document.body
  );
};
