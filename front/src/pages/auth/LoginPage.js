// pages/auth/LoginPage.js
import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import OAuthButtons from '../../components/auth/OAuthButtons';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            애니멀 인사이드
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            반려동물과 함께하는 특별한 만남
          </p>
        </div>

        <LoginForm />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">또는</span>
          </div>
        </div>

        <OAuthButtons />
      </div>
    </div>
  );
};

export default LoginPage;