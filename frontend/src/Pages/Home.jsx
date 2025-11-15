import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import RoomCard from '../Components/RoomCard';
import RoomCreation from '../Components/RoomCreation';
import { 
    FiSearch, 
    FiRefreshCw, 
    FiLogOut, 
    FiUser, 
    FiGrid,
    FiClock
} from 'react-icons/fi';

const Home = () => {
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'participants'
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token) {
            navigate('/login');
            return;
        }
        
        if (userData) {
            setUser(JSON.parse(userData));
            fetchRooms();
        }
    }, [navigate]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/rooms`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setRooms(response.data.rooms);
            }
        } catch (error) {
            console.error('Fetch rooms error:', error);
            toast.error('Failed to fetch rooms');
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        localStorage.removeItem('user-id');
        localStorage.removeItem('room-id');
        localStorage.removeItem('room-name');
        navigate('/login');
    };

    const handleRoomCreated = (newRoom) => {
        setRooms(prevRooms => [newRoom, ...prevRooms]);
    };

    const handleEditRoom = (room) => {
        // TODO: Implement room editing modal
        toast.info('Room editing coming soon!');
    };

    const filteredAndSortedRooms = () => {
        let filtered = rooms;

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = rooms.filter(room =>
                room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.roomId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Sort rooms
        switch (sortBy) {
            case 'name':
                return filtered.sort((a, b) => a.roomName.localeCompare(b.roomName));
            case 'participants':
                return filtered.sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0));
            case 'files':
                return filtered.sort((a, b) => (b.fileCount || 0) - (a.fileCount || 0));
            case 'recent':
            default:
                return filtered.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 flex">
            {/* Room Creation Sidebar */}
            <RoomCreation onRoomCreated={handleRoomCreated} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 border-b border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Welcome back, {user.username}!</h1>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchRooms}
                                disabled={loading}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                            >
                                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                            >
                                <FiLogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-gray-800/50 border-b border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        {/* Search */}
                        <div className="relative max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search rooms..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Sort and Stats */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-400 text-sm">
                                <FiGrid className="w-4 h-4" />
                                <span>{filteredAndSortedRooms().length} rooms</span>
                            </div>
                            
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="recent">Recent Activity</option>
                                <option value="name">Name</option>
                                <option value="participants">Participants</option>
                                <option value="files">Files</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Rooms Grid */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <FiRefreshCw className="w-5 h-5 animate-spin" />
                                <span>Loading rooms...</span>
                            </div>
                        </div>
                    ) : filteredAndSortedRooms().length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAndSortedRooms().map((room) => (
                                <RoomCard
                                    key={room._id}
                                    room={room}
                                    onEdit={handleEditRoom}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FiGrid className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">
                                {searchQuery ? 'No matching rooms found' : 'No rooms yet'}
                            </h3>
                            <p className="text-sm text-center max-w-md">
                                {searchQuery 
                                    ? 'Try adjusting your search query or create a new room.'
                                    : 'Create your first room to start collaborating with others!'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
