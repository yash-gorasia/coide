import React from 'react'

const Client = ({ username }) => {
    // Generate a consistent color based on username
    const getColor = (name) => {
        const colors = [
            'bg-gradient-to-br from-blue-500 to-blue-600',
            'bg-gradient-to-br from-purple-500 to-purple-600', 
            'bg-gradient-to-br from-green-500 to-green-600',
            'bg-gradient-to-br from-red-500 to-red-600',
            'bg-gradient-to-br from-yellow-500 to-yellow-600',
            'bg-gradient-to-br from-pink-500 to-pink-600',
            'bg-gradient-to-br from-indigo-500 to-indigo-600',
            'bg-gradient-to-br from-teal-500 to-teal-600',
            'bg-gradient-to-br from-orange-500 to-orange-600',
            'bg-gradient-to-br from-cyan-500 to-cyan-600'
        ];
        
        if (!name) return colors[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
    const initial = getInitial(username);
    const colorClass = getColor(username);

    return (
        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700/30 transition-all duration-200">
            <div className={`${colorClass} w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20`}>
                {initial}
            </div>
            <span className="text-gray-200 text-xs font-medium truncate flex-1" title={username}>
                {username}
            </span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
        </div>
    )
}

export default Client
