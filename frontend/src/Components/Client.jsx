import React from 'react'


const Client = ({ username }) => {
    const bgColor = '#0000FF'; // Blue color
    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '';

    const initial = getInitial(username);

    return (
        <div className='client'>
            <div
                className='logo'
                style={{
                    backgroundColor: bgColor,
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}
            >
                {initial}
            </div>
            <span className='username'>{username}</span>
        </div>
    )
}

export default Client
