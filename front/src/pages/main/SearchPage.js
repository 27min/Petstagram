import React from "react";

// Search Page
const SearchPage = () => {
    return (
      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">추천 검색어</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">강아지</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">고양이</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">애견카페</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">산책</span>
          </div>
        </div>
      </div>
    );
  };

export default SearchPage;