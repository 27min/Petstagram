export const formatMessageTime = (createdAt) => {
  if (!createdAt) return '';
  
  try {
    const messageDate = new Date(createdAt);
    
    if (isNaN(messageDate.getTime())) {
      console.error('Invalid date:', createdAt);
      return '';
    }

    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageDate.toLocaleString('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }

  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const sortMessagesByTime = (messages) => {
  return [...messages].sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};