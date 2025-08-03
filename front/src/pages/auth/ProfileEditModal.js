import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import { authService } from '../../services/authService';
import { Upload } from 'lucide-react';

const ProfileEditModal = ({ memberInfo, onClose, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    profilePictureUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (memberInfo) {
      setProfileData({
        name: memberInfo.name || '',
        phoneNumber: memberInfo.phoneNumber || '',
        password: '',
        confirmPassword: '',
        profilePictureUrl: memberInfo.profilePictureUrl || ''
      });
      setImagePreview(memberInfo.profilePictureUrl);
    }
  }, [memberInfo]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }
  
    try {
      setUploading(true);
  
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', 'profiles');
  
      // S3 업로드
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader()
          // Content-Type은 자동으로 설정되므로 명시하지 않음
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 업로드 실패');
      }
  
      const data = await response.json();
      console.log('Upload response:', data); // 응답 확인용 로그
      
      // 미리보기 설정
      setImagePreview(URL.createObjectURL(file));
      
      // profileData 업데이트
      setProfileData(prev => ({
        ...prev,
        profilePictureUrl: data.url
      }));
  
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || '파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (profileData.password !== profileData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const headers = {
        ...authService.getAuthHeader(),
        'Content-Type': 'application/json'
      };

      const updateData = {
        name: profileData.name,
        phoneNumber: profileData.phoneNumber,
        profilePictureUrl: profileData.profilePictureUrl,
        ...(profileData.password && { password: profileData.password })
      };

      const response = await fetch(`${API_BASE_URL}/api/member/update`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('프로필 업데이트 실패');
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">프로필 수정</h2>
        <form onSubmit={handleSubmit}>
          {/* 프로필 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">프로필 사진</label>
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="profile-image"
                  disabled={uploading}
                />
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer block w-full h-full"
                >
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500 mt-2">
                          {uploading ? '업로드 중...' : '사진 선택'}
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 기존 입력 필드들 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">전화번호</label>
            <input
              type="tel"
              name="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">새 비밀번호 (선택)</label>
            <input
              type="password"
              name="password"
              value={profileData.password}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={profileData.confirmPassword}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={uploading}
            >
              {uploading ? '업로드 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;