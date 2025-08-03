import React, { useEffect, useState } from 'react';

const InfiniteScroll = ({ fetchItems, renderItem, pageSize = 10 }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadItems = async () => {
    try {
      const newItems = await fetchItems(page, pageSize);
      setItems((prev) => [...prev, ...newItems]);
      if (newItems.length < pageSize) setHasMore(false);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  useEffect(() => {
    loadItems();
  }, [page]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight
    ) {
      if (hasMore) setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

  return <div>{items.map(renderItem)}</div>;
};

export default InfiniteScroll;
