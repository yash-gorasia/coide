import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiUsers, 
    FiFile, 
    FiCalendar, 
    FiClock,
    FiEdit3,
    FiTag
} from 'react-icons/fi';

const RoomCard = ({ room, onEdit, onDelete }) => {
    const navigate = useNavigate();

    const handleJoinRoom = () => {
        // Store room info and navigate to playground
        localStorage.setItem('room-id', room.roomId);
        localStorage.setItem('room-name', room.roomName);
        navigate(`/playground/${room.roomId}`);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getCreatorName = () => {
        return room.createdBy?.username || 'Unknown';
    };

    const isCreator = () => {
        const userId = localStorage.getItem('user-id');
        return room.createdBy?._id === userId;
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all duration-200 hover:shadow-lg group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate mb-1">
                        {room.roomName}
                    </h3>
                    <p className="text-sm text-gray-400">
                        by {getCreatorName()}
                    </p>
                </div>
                
                {/* {isCreator() && (
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(room);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"
                            title="Edit room"
                        >
                            <FiEdit3 className="w-4 h-4" />
                        </button>
                    </div>
                )} */}
            </div>

            {/* Description */}
            {room.description && (
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {room.description}
                </p>
            )}

            {/* Room ID */}
            <div className="mb-4">
                <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-400">Room ID:</span>
                    <code className="bg-gray-700 text-gray-200 px-2 py-1 rounded font-mono">
                        {room.roomId}
                    </code>
                </div>
            </div>

            {/* Tags */}
            {room.tags && room.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {room.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full"
                        >
                            <FiTag className="w-3 h-3 mr-1" />
                            {tag}
                        </span>
                    ))}
                    {room.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                            +{room.tags.length - 3} more
                        </span>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{room.participantCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FiFile className="w-4 h-4" />
                        <span>{room.fileCount || 0}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <FiCalendar className="w-3 h-3" />
                    <span>Created {formatDate(room.createdAt)}</span>
                </div>
                
                <button
                    onClick={handleJoinRoom}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    Join Room
                </button>
            </div>
        </div>
    );
};

export default RoomCard;