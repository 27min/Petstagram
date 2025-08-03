import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ChatService } from "../../services/chatService";
import SearchResultsPage from "./SearchResultsPage";

const CommunityPage = ({ onPageChange }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [roomName, setRoomName] = useState("");
	const [roomDescription, setRoomDescription] = useState("");
	const [chatRooms, setChatRooms] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { currentUser } = useAuth();
	const [searchKeyword, setSearchKeyword] = useState("");
	const [searchResults, setSearchResults] = useState(null);
	const [isSearching, setIsSearching] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [dropdownOpen, setDropdownOpen] = useState(null); // 드롭다운 상태 추가
	const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
	const [selectedRoomId, setSelectedRoomId] = useState(null);

	// 드롭다운 열기/닫기 함수
	const toggleDropdown = (roomId) => {
			setDropdownOpen((prev) => (prev === roomId ? null : roomId));
	};

	// 모달 열기
	const openLeaveModal = (roomId) => {
			setSelectedRoomId(roomId);
			setIsLeaveModalOpen(true);
	};

	// 모달 닫기
	const closeLeaveModal = () => {
			setIsLeaveModalOpen(false);
			setSelectedRoomId(null);
	};

	// 나가기 확정
	const confirmLeaveRoom = async () => {
			if (!selectedRoomId) return;

			try {
					await handleLeaveRoom(selectedRoomId);
			} catch (error) {
					console.error('Error leaving room:', error.message);
			} finally {
					closeLeaveModal();
			}
	};


	// 검색 결과 페이지에서 뒤로가기
	const handleBackFromSearch = () => {
		setSearchResults(null);
		setIsSearching(false);
		setSearchKeyword("");
	};

	// 채팅방 나가기 처리 함수
	const handleLeaveRoom = async (roomId) => {
		try {
				setLoading(true);
				await ChatService.leaveRoom(roomId);
				setChatRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
		} catch (error) {
				alert("채팅방 나가기에 실패했습니다: " + error.message);
		} finally {
				setLoading(false);
		}
};


	// 채팅방 참여 처리
	const handleJoinRoom = async (roomId) => {
		try {
			setLoading(true);
			
			// 채팅방 참여
			const response = await ChatService.joinRoom(roomId);
			
			// 채팅방 페이지로 이동
			onPageChange('chatRoom', { 
				roomId: roomId,
				roomName: response.roomName,
				currentUser: currentUser
			});
		} catch (error) {
			setError('채팅방 입장에 실패했습니다: ' + error.message);
		} finally {
			setLoading(false);
		}
	};
	
	// 채팅방 목록 로드
	const loadChatRooms = async () => {
		try {
			setLoading(true);
			setError(null);
			const rooms = await ChatService.getRooms();
			setChatRooms(rooms);
		} catch (error) {
			setError('채팅방 목록을 불러오는데 실패했습니다: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	// 검색어 입력 핸들러
	const handleSearchChange = (e) => {
		setSearchKeyword(e.target.value);
	};

	// 검색 페이지에서도 동작하는 검색 함수
	const handleSearch = async (e) => {
		e.preventDefault();
		if (!searchKeyword.trim()) return;
	
		try {
			setLoading(true);
			setError(null);
			const response = await ChatService.searchRooms(searchKeyword, currentPage);
			setSearchResults(response.content);
			setTotalPages(response.totalPages);
			setTotalElements(response.totalElements);
			if (!isSearching) {
				setIsSearching(true);
			}
		} catch (error) {
			setError('채팅방 검색 중 오류가 발생했습니다: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	// 페이지 변경 핸들러 추가
	const handlePageChange = async (newPage) => {
		try {
			setLoading(true);
			setCurrentPage(newPage);
			const response = await ChatService.searchRooms(searchKeyword, newPage);
			setSearchResults(response.content);
			setTotalPages(response.totalPages);
			setTotalElements(response.totalElements);
		} catch (error) {
			setError('검색 결과를 불러오는데 실패했습니다: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	
	useEffect(() => {
		loadChatRooms();
	}, []);

	// 검색 결과 페이지 표시 중이면 SearchResultsPage 컴포넌트를 렌더링
	if (isSearching) {
		return (
			<SearchResultsPage 
				searchResults={searchResults || []}
				onBack={handleBackFromSearch}
				onJoinRoom={handleJoinRoom}
				loading={loading}
				error={error}
				searchKeyword={searchKeyword}
				onSearchChange={handleSearchChange}
				onSearch={handleSearch}
				currentPage={currentPage}
				totalPages={totalPages}
				totalElements={totalElements}
				onPageChange={handlePageChange}
			/>
		);
	}

	// 채팅방 생성 처리
	const handleCreateRoom = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setError(null);
			
			const newRoom = await ChatService.createRoom({
				roomName,
				description: roomDescription,
				roomType: true, // 오픈채팅
				isActive: true
			});
			
			// 새로운 채팅방을 목록에 추가
			setChatRooms(prev => [...prev, newRoom]);
			
			// 모달 닫고 입력 필드 초기화
			setIsModalOpen(false);
			setRoomName("");
			setRoomDescription("");
			
			// 생성된 방으로 자동 입장
			await handleJoinRoom(newRoom.id);
			
		} catch (error) {
			setError('채팅방 생성에 실패했습니다: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading && chatRooms.length === 0) {
		return <div className="p-4 text-center">채팅방 목록을 불러오는 중...</div>;
	}

	return (
		<div className="p-4">
			<div className="bg-white rounded-lg shadow p-4 mb-4">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">오픈채팅</h2>
					<button
						onClick={() => setIsModalOpen(true)}
						className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
						disabled={loading}
					>
						채팅방 만들기
					</button>
				</div>

				{/* 검색창 추가 */}
				<form onSubmit={handleSearch} className="mb-4">
					<div className="flex gap-2">
						<input
							type="text"
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							placeholder="채팅방 검색..."
							className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="submit"
							className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
							disabled={loading}
						>
							검색
						</button>
					</div>
				</form>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}

				<div className="space-y-4">
					{chatRooms.map((room) => {
						// 시간 포맷팅 함수
						const formatTime = (dateString) => {
							const messageDate = new Date(dateString);
							const today = new Date();
							const isToday = messageDate.toDateString() === today.toDateString();
							
							if (isToday) {
								return messageDate.toLocaleTimeString('ko-KR', {
									hour: '2-digit',
									minute: '2-digit',
									hour12: true
								});
							} else {
								return messageDate.toLocaleDateString('ko-KR', {
									month: 'long',
									day: 'numeric'
								});
							}
						};

						return (
							<div 
								key={room.id} 
								className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
								onClick={() => {
									if (!isLeaveModalOpen && dropdownOpen !== room.id) {
											handleJoinRoom(room.id);
									}
							}}
							>
								
								<div className="flex justify-between items-center">
									<h3 className="font-medium text-lg flex items-center">{room.roomName}
										<span className="text-sm text-stone-400 mx-3">
											{room.memberCount || 0}
										</span>
									</h3>
									
									<div className="relative flex justify-between items-center">
											<button
													onClick={(e) => {
															e.stopPropagation(); // 이벤트 버블링 방지
															toggleDropdown(room.id); // 드롭다운 열기/닫기
													}}
													className="text-gray-500 hover:text-gray-700"
											>
													⋮
											</button>
										{dropdownOpen === room.id && (
											<div className="absolute top-4 right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
														<button
																onClick={(e) => {
																	e.stopPropagation();
																	openLeaveModal(room.id);
																}}
																className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
																>
																채팅방 나가기
														</button>
												</div>
										)}
									</div>
										{isLeaveModalOpen && (
											<div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
													<div className="bg-white rounded-lg p-6 w-80">
															<h3 className="text-lg font-semibold mb-4">채팅방을 나가시겠습니까?</h3>
															<div className="flex justify-end space-x-3">
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			closeLeaveModal();
																		}}
																		className="text-blue-500 hover:underline"
																	>
																			취소
																	</button>
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			confirmLeaveRoom();
																		}}
																			className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
																	>
																			나가기
																	</button>
															</div>
													</div>
											</div>
										)}

								</div>
								
								<div className="flex justify-between items-center mt-2">
									<p className="text-sm text-gray-600 line-clamp-1 flex-1">
										{room.lastMessage || "최근 메시지가 없습니다."}
									</p>
									{room.unreadCount > 0 && (
										<span className="bg-red-400 text-white text-xs font-medium px-2.5 py-1 rounded-full ml-4">
											{room.unreadCount}
										</span>
									)}
									<span className="text-xs text-gray-500">
										{formatTime(room.lastMessageTime || room.createdAt)}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* 채팅방 생성 모달 */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-96">
						<h3 className="text-lg font-semibold mb-4">새 채팅방 만들기</h3>
						<form onSubmit={handleCreateRoom}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									방 이름
								</label>
								<input
									type="text"
									value={roomName}
									onChange={(e) => setRoomName(e.target.value)}
									className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="채팅방 이름을 입력하세요"
									required
									disabled={loading}
								/>
							</div>
							<div className="flex justify-end space-x-3">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="px-4 py-2 text-gray-600 hover:text-gray-800"
									disabled={loading}
								>
									취소
								</button>
								<button
									type="submit"
									className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
									disabled={loading}
								>
									{loading ? '생성 중...' : '만들기'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default CommunityPage;