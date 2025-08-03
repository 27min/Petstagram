// components/auth/OAuthButtons.js
import React from 'react';

const OAuthButtons = () => {
  const handleOAuthLogin = (provider) => {
    // OAuth 로그인 처리 로직
    console.log(`${provider} 로그인 시도`);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleOAuthLogin('kakao')}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-600 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
      >
        카카오로 시작하기
      </button>

      <button
        onClick={() => handleOAuthLogin('naver')}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        네이버로 시작하기
      </button>

      <button
        onClick={() => handleOAuthLogin('google')}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Google로 시작하기
      </button>
    </div>
  );
};

export default OAuthButtons;