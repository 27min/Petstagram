import React, { useState } from 'react';
import { API_BASE_URL } from "../../config/apiConfig";
import { authService } from "../../services/authService";
import { Upload } from 'lucide-react';

const PostForm = ({ onPostSubmit, onClose }) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]); // 여러 미디어 파일을 저장하는 배열
  const [previews, setPreviews] = useState([]); // 여러 미디어 미리보기를 저장하는 배열
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 최대 5개 파일로 제한
    if (mediaFiles.length + files.length > 5) {
      alert('최대 5개의 파일만 업로드할 수 있습니다.');
      return;
    }

    for (const file of files) {
      // 파일 유효성 검사
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      if (!validTypes.includes(file.type)) {
        alert('이미지(JPEG, PNG, GIF) 또는 동영상(MP4) 파일만 업로드 가능합니다.');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('각 파일의 크기는 10MB를 초과할 수 없습니다.');
        continue;
      }

      try {
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('directory', 'posts');

        const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
          method: 'POST',
          headers: {
            ...authService.getAuthHeader()
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '파일 업로드 실패');
        }

        const data = await response.json();
        
        // 새로운 미디어 파일 추가
        setMediaFiles(prev => [...prev, {
          mediaUrl: data.url,
          mediaType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          displayOrder: prev.length // 순서 정보 추가
        }]);
        
        // 미리보기 추가
        setPreviews(prev => [...prev, URL.createObjectURL(file)]);

      } catch (error) {
        console.error('Upload error:', error);
        alert(error.message || '파일 업로드에 실패했습니다.');
      }
    }
    setUploading(false);
  };

  // 미디어 파일 삭제
  const handleRemoveMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || mediaFiles.length === 0) {
      alert("내용과 미디어 파일을 모두 입력해주세요.");
      return;
    }

    if (content.length > 255) {
      alert("내용은 255자를 초과할 수 없습니다.");
      return;
    }
    
    const postData = {
      content: content.trim(),
      mediaList: mediaFiles
    };
    console.log('전송할 데이터:', postData);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: {
          ...authService.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error("게시글 등록 실패");

      setContent("");
      setMediaFiles([]);
      setPreviews([]);
      
      onPostSubmit();
      onClose();
      
    } catch (error) {
      console.error("게시글 등록 중 오류 발생:", error);
      alert(error.message || "게시글 등록에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">새 게시글 작성</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 내용 입력 부분은 동일 */}
          <div>
            <label className="block text-sm font-medium mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
              placeholder="게시글 내용을 입력하세요"
              required
            />
          </div>

          {/* 미디어 파일 업로드 영역 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              미디어 파일 ({mediaFiles.length}/5)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  {mediaFiles[index]?.type === 'VIDEO' ? (
                    <video
                      src={preview}
                      controls
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={preview}
                      alt={`미디어 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {mediaFiles.length < 5 && (
                <div className="w-full h-32">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*, video/mp4"
                    className="hidden"
                    id="media-file"
                    disabled={uploading}
                    multiple
                  />
                  <label
                    htmlFor="media-file"
                    className="cursor-pointer flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <span className="text-sm text-gray-500">
                        {uploading ? '업로드 중...' : '추가'}
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={uploading || mediaFiles.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? '업로드 중...' : '게시하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;