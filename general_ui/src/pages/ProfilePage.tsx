import { useState } from 'react';
import { Edit2Icon } from '../icons';

interface ProfilePageProps {
  userEmail?: string;
  profileData?: any;
}

export default function ProfilePage({ userEmail = 'demo@healthcare.com', profileData: initialProfileData }: ProfilePageProps) {
  const [profileData, setProfileData] = useState(initialProfileData || {
    firstName: 'John',
    lastName: 'Doe',
    email: userEmail,
    phone: '+31687888785',
    title: 'Medical Professional',
    country: 'Netherlands',
    city: 'Amsterdam',
    street: 'Europalaan',
    postalCode: '5700XL',
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(profileData);

  const getUserInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handleEditToggle = () => {
    setEditData(profileData);
    setEditMode(!editMode);
  };

  const handleSave = () => {
    setProfileData(editData);
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData({
      ...editData,
      [field]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">Profile</h1>

        {/* Profile Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg md:rounded-xl shadow-lg mb-6 sm:mb-8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {getUserInitials(profileData.firstName, profileData.lastName)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                  <span className="text-xs sm:text-sm text-gray-300 bg-slate-700 px-2 sm:px-3 py-1 rounded-full">
                    {profileData.title}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={handleEditToggle} className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700 hover:border-purple-500 transition-all w-full sm:w-auto justify-center sm:justify-start">
              <Edit2Icon size={18} />
              <span className="text-sm sm:text-base">Edit</span>
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg md:rounded-xl shadow-lg mb-6 sm:mb-8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Personal Information</h3>
            {!editMode ? (
              <button onClick={handleEditToggle} className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700 hover:border-purple-500 transition-all w-full sm:w-auto justify-center">
                <Edit2Icon size={18} />
                <span className="text-sm sm:text-base">Edit</span>
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">First Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Last Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Email Address</label>
              {editMode ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.email}</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Phone Number</label>
              {editMode ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.phone}</p>
              )}
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Title</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.title}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg md:rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Address Information</h3>
            {editMode ? (
              <div className="flex space-x-2 w-full sm:w-auto">
                <button onClick={handleSave} className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all">
                  Save
                </button>
                <button onClick={handleEditToggle} className="flex-1 sm:flex-none px-4 py-2 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700 transition-all text-sm sm:text-base">
                  Cancel
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Country</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.country}</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">City</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.city}</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Street</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.street}</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Postal Code</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
                />
              ) : (
                <p className="text-white text-sm sm:text-base font-semibold">{profileData.postalCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
