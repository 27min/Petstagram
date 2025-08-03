import React, { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';

const FileUpload = ({ onUploadSuccess, directory = 'default' }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);

      // API 호출
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 성공 시 URL 전달
      if (response.data.url) {
        onUploadSuccess(response.data.url);
        // 이미지일 경우 미리보기 설정
        if (file.type.startsWith('image/')) {
          setPreview(URL.createObjectURL(file));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || '파일 업로드 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mt-2">
        <label className="block">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
            accept="image/*,video/*"
          />
          <div className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 cursor-pointer">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {loading ? '업로드 중...' : '파일을 선택하세요'}
                </span>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileUpload;