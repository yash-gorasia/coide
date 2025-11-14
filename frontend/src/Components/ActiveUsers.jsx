import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../Context/SocketContext";
import { toast } from "react-toastify";
import Client from "./Client";
import { FiUsers, FiCopy, FiLogOut, FiChevronDown, FiChevronUp } from "react-icons/fi";

const ActiveUsers = () => {
  const { clients } = useSocket();
  const roomId = localStorage.getItem("room-id");
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const copyId = () => {
    if (roomId) {
      navigator.clipboard
        .writeText(roomId)
        .then(() => toast.success(`Copied ROOM ID: ${roomId}`))
        .catch(() => toast.error("Failed to copy ROOM ID"));
    }
  };

  const handleLeave = () => {
    navigate("/");
    localStorage.clear();
  };

  return (
    <div className="w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl text-white">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/50 transition-all duration-200 rounded-t-lg border-b border-gray-700/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <FiUsers className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-sm">Collaborators</span>
          <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full text-xs font-medium">
            {clients.length}
          </span>
        </div>
        {isExpanded ? (
          <FiChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <FiChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <>
          {/* Users List */}
          <div className="p-3 max-h-48 overflow-y-auto bg-gray-800/30">
            <div className="space-y-1">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <Client key={client.socketId} username={client.username} />
                ))
              ) : (
                <div className="text-gray-400 text-sm text-center py-3">
                  No users connected
                </div>
              )}
            </div>
          </div>

          {/* Room Info & Actions */}
          <div className="border-t border-gray-700/50 p-3 space-y-2 bg-gray-800/50">
            <div className="text-xs text-gray-400">
              Room: <span className="text-gray-300 font-mono">{roomId?.slice(0, 8)}...</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={copyId}
                className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-md bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30 transition-all text-xs font-medium"
              >
                <FiCopy className="w-3 h-3" />
                <span>Copy</span>
              </button>
              
              <button
                onClick={handleLeave}
                className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-md bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 transition-all text-xs font-medium"
              >
                <FiLogOut className="w-3 h-3" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default ActiveUsers;
