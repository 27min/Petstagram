import React, { useState } from 'react';
import KakaoMap from '../../components/map/KakaoMap';
import { Search } from 'lucide-react';

const PlacePage = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentKeyword(searchKeyword);
  };

  return (
    <div className="w-full h-full p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="반려동물 동반 가능한 장소를 검색해보세요"
                className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </form>

        {/* 빠른 검색 버튼들 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['애견동반 카페', '공원', '동물 병원', '애견미용'].map((keyword) => (
            <button
              key={keyword}
              onClick={() => {
                setSearchKeyword(keyword);
                setCurrentKeyword(keyword);
              }}
              className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* 지도 컴포넌트 */}
        <div className="border rounded-lg overflow-hidden">
          <KakaoMap searchKeyword={currentKeyword} />
        </div>

        {/* 하단 설명 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">이용 안내</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 반려동물 동반 가능 여부는 사전에 해당 장소에 확인하시는 것을 권장합니다.</li>
            <li>• 영업시간 및 이용조건은 변동될 수 있습니다.</li>
            <li>• 장소에 대한 후기와 정보는 커뮤니티에서 공유해주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlacePage;