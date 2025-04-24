import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useSocket } from '../Context/SocketContext';
import { usePeer } from '../Context/PeerContext';
import ACTIONS from '../Constants/socketEvents';
import { FaChevronDown, FaChevronUp, FaSquare, FaPhone, FaPhoneSlash } from 'react-icons/fa';

const VideoCalling = () => {
    const [myStream, setMyStream] = useState(null);
    const { socket, clients } = useSocket();
    const { createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream } = usePeer();
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected

    // Refs for video elements as fallback
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Initialize call to another user
    const initializeCall = async () => {
        if (clients.length <= 1 || callStatus !== 'idle') return;

        try {
            setCallStatus('calling');

            // Make sure to get the user media before creating an offer
            if (!myStream) {
                await getUserMediaStream();
            }

            const offer = await createOffer();
            socket.emit(ACTIONS.CALL_USER, {
                offer,
                to: clients[clients.length - 1]?.socketId, // Call the last client in the list
            });
        } catch (error) {
            console.error("Failed to create offer:", error);
            setCallStatus('idle');
        }
    };

    // Handle when call is accepted
    const handleCallAccepted = async ({ answer }) => {
        try {
            await setRemoteAnswer(answer);
            setCallStatus('connected');
        } catch (error) {
            console.error("Error setting remote answer:", error);
        }
    };

    // Handle incoming call
    const handleIncomingCall = async ({ offer, from, username }) => {
        try {
            // Make sure we have our media stream before answering
            if (!myStream) {
                await getUserMediaStream();
            }

            setCallStatus('calling');
            const answer = await createAnswer(offer);
            socket.emit(ACTIONS.CALL_ACCEPTED, {
                username,
                socketId: from,
                answer
            });
            setCallStatus('connected');
        } catch (error) {
            console.error("Error handling incoming call:", error);
            setCallStatus('idle');
        }
    };

    // Get local media stream
    const getUserMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            setMyStream(stream);

            // Send stream to peer
            sendStream(stream);

            // Also set the stream to local video element as fallback
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            return stream;
        } catch (error) {
            console.error("Error getting user media:", error);
            throw error;
        }
    };

    // Setup socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on(ACTIONS.INCOMING_CALL, handleIncomingCall);
        socket.on(ACTIONS.CALL_ACCEPTED, handleCallAccepted);

        return () => {
            socket.off(ACTIONS.INCOMING_CALL, handleIncomingCall);
            socket.off(ACTIONS.CALL_ACCEPTED, handleCallAccepted);
        };
    }, [socket]);

    // Automatically call if there's more than one client
    useEffect(() => {
        if (clients.length > 1 && callStatus === 'idle') {
            initializeCall();
        }
    }, [clients, callStatus]);

    // Initialize local stream when component mounts
    useEffect(() => {
        getUserMediaStream();

        // Cleanup function to stop tracks when component unmounts
        return () => {
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Set remote stream to video element when available
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);




    return (
        <div className="absolute left-6 w-60 bg-zinc-800 rounded-lg shadow-lg p-3">
            <h2 className="text-sm font-semibold text-white mb-2">Video Call</h2>
            <div className="flex flex-col gap-2">
                <div className="relative bg-zinc-900 rounded-lg overflow-hidden aspect-video">
                    <div className="absolute top-1 left-1 bg-black bg-opacity-50 px-1 py-0.5 rounded text-xs text-white">
                        You 
                    </div>
                    {myStream ? (
                        <ReactPlayer url={myStream} playing muted width="100%" height="100%" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                            Loading...
                        </div>
                    )}
                </div>

                <div className="relative bg-zinc-900 rounded-lg overflow-hidden aspect-video">
                    <div className="absolute top-1 left-1 bg-black bg-opacity-50 px-1 py-0.5 rounded text-xs text-white">
                        Peer
                    </div>
                    {remoteStream ? (
                        <ReactPlayer url={remoteStream} playing width="100%" height="100%" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                            {callStatus === 'connected' ? 'Waiting for peer...' : 'No peer'}
                        </div>
                    )}
                </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">Users: {clients.length}</p>
        </div>

    );
};

export default VideoCalling;