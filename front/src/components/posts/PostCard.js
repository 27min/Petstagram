import React, { useState } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';
import { PostService } from '../../services/PostService';

const PostCard = ({ 
  postId,
  memberId,
  memberName, 
  content, 
  createdAt, 
  mediaList,
  initialLikes = 0,
  initialComments = [],
  onComment,
  profileUrl,
  isLiked: initialIsLiked,
  likes: likeCount,  // props로 받도록 수정
  onLike,
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await PostService.unlikePost(postId);
      } else {
        await PostService.likePost(postId);
      }
      
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);

      if (onLike) {
        await onLike(postId, !isLiked);
      }
    } catch (error) {
      console.error('Failed to handle like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      if (onComment) {
        const commentData = await onComment(postId, newComment);
        setComments(prev => [...prev, commentData]);
      }
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="bg-white border rounded-lg mb-4 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img
              src={profileUrl}
              alt={memberName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium">{memberName}</span>
        </div>
        <button className="text-gray-500">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 미디어 */}
      {mediaList && mediaList.length > 0 && (
        <div className="relative">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {mediaList.map((media, index) => (
              <div 
                key={media.id} 
                className="flex-none w-full snap-center"
                onClick={() => setCurrentMediaIndex(index)}
              >
                <img 
                  src={media.mediaUrl}
                  alt={`게시물 이미지 ${index + 1}`}
                  className="w-full h-96 object-cover"
                />
              </div>
            ))}
          </div>
          
          {mediaList.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {mediaList.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMediaIndex ? 'bg-blue-500' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleLike}
            className={`transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          {likes > 0 && (
            <p className="text-sm font-medium text-gray-500">
              {likes}
            </p>
          )}
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-gray-500"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
        
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 pb-2">
        <p className="text-sm mb-1">
          {content}
        </p>
        <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div className="border-t">
          <div className="max-h-48 overflow-y-auto p-4">
            {comments.map((comment, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm">
                  <span className="font-medium mr-2">{comment.memberName}</span>
                  {comment.content}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            ))}
          </div>
          
          {/* 댓글 입력 */}
          <form onSubmit={handleComment} className="border-t p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글 달기..."
                className="flex-1 text-sm border-none focus:ring-0"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="text-blue-500 disabled:text-gray-300"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;