import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';
import { authService } from '../../services/authService';

const StoryComments = ({ storyId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories/${storyId}/comments`, {
        headers: authService.getAuthHeader()
      });
      
      if (!response.ok) throw new Error('댓글을 불러오는데 실패했습니다.');
      
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  // 대댓글 가져오기
  const fetchReplies = async (commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stories/comments/${commentId}/replies`,
        {
          headers: authService.getAuthHeader()
        }
      );
      
      if (!response.ok) throw new Error('답글을 불러오는데 실패했습니다.');
      
      const replies = await response.json();
      
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies } 
            : comment
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // 댓글 작성 처리
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stories/comments`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storyId,
          content: newComment,
          parentId: replyTo?.id
        })
      });

      if (!response.ok) throw new Error('댓글 작성에 실패했습니다.');

      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 대댓글 토글
  const toggleReplies = async (commentId) => {
    if (!expandedComments[commentId]) {
      await fetchReplies(commentId);
    }
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return commentDate.toLocaleString();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white rounded-t-lg overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">댓글</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 text-red-500">
            {error}
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="overflow-y-auto max-h-[calc(80vh-8rem)] p-4">
          {comments.map(comment => (
            <div key={comment.id} className="mb-4">
              {/* 댓글 */}
              <div className="flex items-start space-x-2">
                <img
                  src={comment.profilePictureUrl || '/api/placeholder/32/32'}
                  alt={comment.memberName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="font-semibold text-sm">{comment.memberName}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{formatTime(comment.createdAt)}</span>
                    <button 
                      onClick={() => setReplyTo(comment)}
                      className="hover:text-blue-500"
                    >
                      답글 달기
                    </button>
                    {comment.replyCount > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center space-x-1 hover:text-blue-500"
                      >
                        <span>답글 {comment.replyCount}개</span>
                        {expandedComments[comment.id] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 대댓글 */}
              {expandedComments[comment.id] && comment.replies && (
                <div className="ml-10 mt-2 space-y-2">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex items-start space-x-2">
                      <img
                        src={reply.profilePictureUrl || '/api/placeholder/32/32'}
                        alt={reply.memberName}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <div className="bg-gray-100 rounded-lg p-2">
                          <p className="font-semibold text-sm">{reply.memberName}</p>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatTime(reply.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 댓글 입력 폼 */}
        <div className="p-4 border-t">
          {replyTo && (
            <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
              <span className="text-sm">
                {replyTo.memberName}님에게 답글 작성 중
              </span>
              <button onClick={() => setReplyTo(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? `${replyTo.memberName}님에게 답글 작성...` : "댓글을 입력하세요..."}
              className="flex-1 p-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="p-2 text-blue-500 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StoryComments;>
            <input
              type="text"
              value={newComment}
              onChange={(e)