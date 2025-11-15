import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    FiPlus, 
    FiX, 
    FiTag,
    FiUser,
    FiHash,
    FiLogIn
} from 'react-icons/fi';

const RoomCreation = ({ onRoomCreated }) => {
    const navigate = useNavigate();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Create room form state
    const [createForm, setCreateForm] = useState({
        roomName: '',
        description: '',
        tags: []
    });
    
    // Join room form state
    const [joinForm, setJoinForm] = useState({
        roomId: ''
    });
    
    const [tagInput, setTagInput] = useState('');

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!createForm.roomName.trim()) {
            toast.error('Room name is required');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/rooms`,
                createForm,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Room created successfully!');
                
                // Store room info and navigate
                localStorage.setItem('room-id', response.data.room.roomId);
                localStorage.setItem('room-name', response.data.room.roomName);
                
                // Reset form
                setCreateForm({ roomName: '', description: '', tags: [] });
                setShowCreateForm(false);
                
                // Notify parent component
                onRoomCreated?.(response.data.room);
                
                // Navigate to playground with room ID
                navigate(`/playground/${response.data.room.roomId}`);
            }
        } catch (error) {
            console.error('Create room error:', error);
            toast.error(error.response?.data?.message || 'Failed to create room');
        }
        setLoading(false);
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        if (!joinForm.roomId.trim()) {
            toast.error('Room ID is required');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const roomId = joinForm.roomId.trim();
            
            // Try to join the room
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/join`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Joined room successfully!');
                
                // Store room info and navigate
                localStorage.setItem('room-id', response.data.room.roomId);
                localStorage.setItem('room-name', response.data.room.roomName);
                
                // Reset form
                setJoinForm({ roomId: '' });
                setShowJoinForm(false);
                
                // Navigate to playground with room ID
                navigate(`/playground/${response.data.room.roomId}`);
            }
        } catch (error) {
            console.error('Join room error:', error);
            toast.error(error.response?.data?.message || 'Failed to join room');
        }
        setLoading(false);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !createForm.tags.includes(tagInput.trim()) && createForm.tags.length < 5) {
            setCreateForm({
                ...createForm,
                tags: [...createForm.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setCreateForm({
            ...createForm,
            tags: createForm.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white mb-2">CoIDE Rooms</h2>
                <p className="text-gray-400 text-sm">Create a new room or join an existing one</p>
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-3">
                <button
                    onClick={() => {
                        setShowCreateForm(true);
                        setShowJoinForm(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-500 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Create New Room</span>
                </button>

                <button
                    onClick={() => {
                        setShowJoinForm(true);
                        setShowCreateForm(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                >
                    <FiLogIn className="w-4 h-4" />
                    <span>Join Room</span>
                </button>
            </div>

            {/* Create Room Form */}
            {showCreateForm && (
                <div className="flex-1 p-6 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Create Room</h3>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Room Name *
                            </label>
                            <input
                                type="text"
                                value={createForm.roomName}
                                onChange={(e) => setCreateForm({ ...createForm, roomName: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter room name"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={createForm.description}
                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Describe your project..."
                                rows={3}
                                maxLength={500}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tags (max 5)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {createForm.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full"
                                    >
                                        <FiTag className="w-3 h-3 mr-1" />
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-red-300"
                                        >
                                            <FiX className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {createForm.tags.length < 5 && (
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleTagKeyPress}
                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Add tag..."
                                        maxLength={50}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        disabled={!tagInput.trim()}
                                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed border border-l-0 border-gray-600 rounded-r-lg text-white"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !createForm.roomName.trim()}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200"
                        >
                            {loading ? 'Creating...' : 'Create Room'}
                        </button>
                    </form>
                </div>
            )}

            {/* Join Room Form */}
            {showJoinForm && (
                <div className="flex-1 p-6 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Join Room</h3>
                        <button
                            onClick={() => setShowJoinForm(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleJoinSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Room ID *
                            </label>
                            <div className="relative">
                                <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={joinForm.roomId}
                                    onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter room ID"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Ask the room creator for the room ID
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !joinForm.roomId.trim()}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200"
                        >
                            {loading ? 'Joining...' : 'Join Room'}
                        </button>
                    </form>
                </div>
            )}

            {/* Footer Info */}
            <div className="p-6 border-t border-gray-700">
                <div className="text-xs text-gray-400 space-y-1">
                    <p>💡 Create rooms to collaborate with your team</p>
                    <p>🔒 Room data is persistent across sessions</p>
                    <p>📁 Files are automatically saved per room</p>
                </div>
            </div>
        </div>
    );
};

export default RoomCreation;