import React from 'react';
import InfiniteScroll from './InfiniteScroll';
import PostCard from './PostCard';
import { fetchPosts } from '../../services/postService';

const PostList = () => {
  const renderPost = (post) => <PostCard key={post.id} post={post} />;

  return (
    <div className="post-list">
      <InfiniteScroll fetchItems={fetchPosts} renderItem={renderPost} />
    </div>
  );
};

export default PostList;
