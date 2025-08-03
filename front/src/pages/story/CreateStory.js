import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Image, X } from 'lucide-react';
import { API_BASE_URL } from "../../config/apiConfig";
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

const CreateStory = ({ onPageChange }) => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const ALLOWED_FILE_TYPES = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'video/mp4': true,
    'video/quicktime': true, // MOV 파일
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!ALLOWED_FILE_TYPES[file.type]) {
      setError('지원하지 않는 파일 형식입니다. 지원되는 형식: JPG, PNG, MP4, MOV, GIF');
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (!isAuthenticated) {
      setError('로그인이 필요합니다.');
      onPageChange('login');
      return;
    }
    
    // 내용과 미디어 파일이 모두 없는 경우
    if (!content.trim() && !mediaFile) {
      setError('스토리 내용이나 미디어 파일을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // FormData 생성 및 데이터 추가
      const formData = new FormData();
      formData.append('content', content.trim());
      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }
      
      // 스토리 생성 요청 (한 번의 요청으로 처리)
      const response = await fetch(`${API_BASE_URL}/api/stories`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader(),
          // Content-Type은 설정하지 않음 (브라우저가 자동으로 설정)
        },
        body: formData,
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '스토리 작성에 실패했습니다.');
      }
        
      onPageChange('myStories');
    } catch (err) {
      setError(err.message);
      console.error('스토리 작성 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setPreviewUrl('');
  };

  const isVideo = mediaFile?.type.startsWith('video/');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => onPageChange('home')} className="text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">스토리 만들기</h1>
        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !mediaFile)}
          className={`px-4 py-1 rounded-full ${
            loading || (!content.trim() && !mediaFile)
              ? 'bg-blue-200 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {loading ? '게시 중...' : '게시'}
        </button>
      </div>

      <div className="flex-1 px-3 py-2 bg-white">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.mp4,.mov"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center justify-center p-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center">
                <Image size={24} className="text-gray-400 mb-2" />
                <span className="text-gray-600">사진/동영상 추가</span>
                <span className="text-gray-400 text-sm mt-1">
                  (JPG, PNG, MP4, MOV, GIF)
                </span>
              </div>
            </div>
          </label>
        </div>

        {previewUrl && (
          <div className="relative mb-4">
            {isVideo ? (
              <video 
                src={previewUrl} 
                className="w-full rounded-lg max-h-64 object-contain" 
                controls
              />
            ) : (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full rounded-lg max-h-64 object-contain"
              />
            )}
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="w-full p-4 border-none focus:ring-0 focus:outline-none bg-white"
          placeholder="스토리를 작성해보세요..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          disabled={loading}
          autoFocus
          rows={1}
          style={{ overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};

export default CreateStory;