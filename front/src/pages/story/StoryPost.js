import React from 'react';

const StoryPost = ({ title, content, createdAt, mediaUrl }) => (
  <div className="border-b pb-4">
    <img 
      src={mediaUrl}
      alt='사진 없음'
      className="h-full w-full object-cover"
    />
    <h3 className="text-sm font-bold">{title}</h3>
    <p className="text-sm">{content}</p>
    <p className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</p>
  </div>
);

export default StoryPost;