import React, { useEffect, useState } from 'react';

const KakaoMap = ({ searchKeyword }) => {
  const [places, setPlaces] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.566826, 126.978656),
          level: 3
        };
        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);

        // 현재 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const currentPos = new window.kakao.maps.LatLng(lat, lng);
              
              // 현재 위치로 지도 이동
              newMap.setCenter(currentPos);

              // 현재 위치 마커 생성
              const locationMarker = new window.kakao.maps.Marker({
                map: newMap,
                position: currentPos,
                image: new window.kakao.maps.MarkerImage(
                  'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                  new window.kakao.maps.Size(32, 35),
                  { offset: new window.kakao.maps.Point(13, 35) }
                )
              });

              // 현재 위치 인포윈도우 생성
              const infowindow = new window.kakao.maps.InfoWindow({
                content: '<div style="padding:5px;font-size:12px;">현재 위치</div>'
              });

              // 마커에 마우스오버 이벤트 추가
              window.kakao.maps.event.addListener(locationMarker, 'mouseover', () => {
                infowindow.open(newMap, locationMarker);
              });

              window.kakao.maps.event.addListener(locationMarker, 'mouseout', () => {
                infowindow.close();
              });

              setCurrentLocation(locationMarker);
            },
            (error) => {
              console.error('Error getting current location:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        }
      });
    };

    return () => {
      document.head.removeChild(script);
      if (currentLocation) {
        currentLocation.setMap(null);
      }
    };
  }, []);

  // searchKeyword로 검색하는 useEffect 부분을 수정
  useEffect(() => {
    if (map && searchKeyword) {
      const ps = new window.kakao.maps.services.Places();
      
      // 현재 지도의 중심 좌표를 가져옴
      const center = map.getCenter();
      
      const searchOptions = {
        location: center,        // 현재 지도 중심 좌표
        radius: 10000,          // 검색 반경(미터 단위) - 10km
        sort: window.kakao.maps.services.SortBy.DISTANCE  // 거리순 정렬
      };
      
      ps.keywordSearch(searchKeyword, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          markers.forEach(marker => marker.setMap(null));
          
          const bounds = new window.kakao.maps.LatLngBounds();
          const newMarkers = [];

          data.forEach(place => {
            const marker = new window.kakao.maps.Marker({
              map: map,
              position: new window.kakao.maps.LatLng(place.y, place.x)
            });
          
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:5px;font-size:12px;">
                  <div>${place.place_name}</div>
                  <div style="margin-top:4px;">
                    <a href="kakaomap://place?id=${place.id}" style="color:blue;text-decoration:underline;">
                      카카오맵으로 보기
                    </a>
                  </div>
                </div>
              `
            });
          
            // 마커 클릭 이벤트 추가
            window.kakao.maps.event.addListener(marker, 'click', () => {
              if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                window.open(`kakaomap://place?id=${place.id}`, '_blank');
              } else {
                window.open(`https://map.kakao.com/link/map/${place.id}`, '_blank');
              }
            });
          
            window.kakao.maps.event.addListener(marker, 'mouseover', () => {
              infowindow.open(map, marker);
            });
          
            window.kakao.maps.event.addListener(marker, 'mouseout', () => {
              infowindow.close();
            });
          
            bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
            newMarkers.push(marker);
          });

          setMarkers(newMarkers);
          setPlaces(data);
          
          // 검색 결과가 있을 때만 bounds 적용
          if (data.length > 0) {
            map.setBounds(bounds);
          }
        }
      }, searchOptions);  // 검색 옵션 추가
    }
  }, [map, searchKeyword]);

  return (
    <div className="w-full h-full">
      <div id="map" className="w-full h-96" />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">검색 결과</h3>
        <ul className="space-y-2">
        {places.map((place, index) => (
          <li 
            key={index} 
            className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            onClick={() => {
              if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                window.open(`kakaomap://place?id=${place.id}`, '_blank');
              } else {
                window.open(`https://map.kakao.com/link/map/${place.id}`, '_blank');
              }
            }}
          >
            <p className="font-medium">{place.place_name}</p>
            <p className="text-sm text-gray-600">{place.address_name}</p>
            {place.phone && <p className="text-sm text-gray-600">{place.phone}</p>}
          </li>
        ))}
        </ul>
      </div>
    </div>
  );
};

export default KakaoMap;