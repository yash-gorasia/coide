import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [user, setUser] = useState(null);
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
        }
    }, [navigate]);

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
        
        if(!roomId) {
            toast.error("Room ID is required!");
            return;
        }

        localStorage.setItem('room-id', roomId);
        navigate(`/playground/${roomId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        localStorage.removeItem('room-id');
        navigate('/login');
    };

    if (!user) {
        return null; // Show loading or redirect to login
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-900'>
            <div className='bg-gray-800 p-8 rounded-xl shadow-lg text-white w-96'>
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h2 className='text-2xl font-semibold'>Welcome, {user.username}!</h2>
                        <p className='text-gray-400 text-sm'>{user.email}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-all duration-200'
                    >
                        Logout
                    </button>
                </div>
                
                <h3 className='text-xl font-semibold text-center mb-4'>Join a Coding Room</h3>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <input
                        type='text'
                        placeholder='Enter Room ID'
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className='p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                    <button
                        type='submit'
                        className='bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-md transition-all duration-200'
                    >
                        Join Room
                    </button>
                </form>
                <p className='text-center text-gray-400 mt-4'>
                    Don't have a room ID?{' '}
                    <span 
                        className='text-purple-400 cursor-pointer hover:underline' 
                        onClick={handleGenerateRoomId}
                    >
                        Generate new room
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Home;
