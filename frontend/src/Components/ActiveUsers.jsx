import React from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../Context/SocketContext";
import { toast } from "react-toastify";
import Client from "./Client";
// import VideoCalling from "./VideoCalling"; 

const ActiveUsers = () => {
  const { clients } = useSocket(); // Get the list of connected users
  const roomId = localStorage.getItem("room-id");
  const navigate = useNavigate();

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
    <div className="flex flex-col h-full bg-zinc-800 p-4 text-white">
      <h3 className="flex justify-center font-bold text-lg mb-4">Connected Users</h3>
      <hr />
      <div className="flex-grow overflow-y-auto m-4">
        <div className="grid grid-cols-2 gap-3">
          {clients.map((client) => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>
        <div className="mt-8">
        {/* <VideoCalling /> */}
        </div>
      </div>
      <div className="mt-auto space-y-3 pt-4">
        <button
          onClick={copyId}
          className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:opacity-90 transition-all"
        >
          Copy ROOM ID
        </button>
        <button
          onClick={handleLeave}
          className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium hover:opacity-90 transition-all"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default ActiveUsers;
