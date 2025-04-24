import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const navigate = useNavigate();

    const handleGenerateRoomId = () => {
        const generateRandomId = (length) => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        };

        setRoomId(generateRandomId(6));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); 
        
        if(!roomId || !username) {
            toast.error("Room Id and username required!");
            return;
        }

        localStorage.setItem('room-id', roomId);
        console.log("username", username);
        
        localStorage.setItem('username', username);
        navigate(`/playground/:${roomId}`);
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-900'>
            <div className='bg-gray-800 p-8 rounded-xl shadow-lg text-white w-96'>
                <h2 className='text-2xl font-semibold text-center mb-4'>Join a Room</h2>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <input
                        type='text'
                        placeholder='Room ID'
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className='p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <input
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                        type='submit'
                        className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-all duration-200'
                    >
                        Join
                    </button>
                </form>
                <p className='text-center text-gray-400 mt-4'>
                    don't have an invite? create a{' '}
                    <span className='text-blue-400 cursor-pointer hover:underline' onClick={handleGenerateRoomId}>new room</span>
                </p>
            </div>
        </div>
    );
};

export default Home;
