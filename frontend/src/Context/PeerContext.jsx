import React, { useState, useEffect, useMemo, createContext, useContext } from 'react'
import { useSocket } from './SocketContext';
import ACTIONS from '../Constants/socketEvents';

const PeerContext = createContext();

export const PeerProvider = ({ children }) => {
    const [remoteStream, setRemoteStream] = useState(null);
    const [pendingCandidates, setPendingCandidates] = useState([]);
    const { socket, clients } = useSocket();

    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [{
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
            ],
        }],
    }), []);

    const createOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }

    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async (answer) => {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));

        // Add any pending ICE candidates after remote description is set
        if (pendingCandidates.length > 0) {
            console.log("Adding pending ICE candidates:", pendingCandidates.length);
            pendingCandidates.forEach(candidate => {
                peer.addIceCandidate(new RTCIceCandidate(candidate));
            });
            setPendingCandidates([]);
        }
    }

    const sendStream = async (stream) => {
        if (!stream) return;

        console.log("Sending stream:", stream);
        const tracks = stream.getTracks();
        tracks.forEach(track => {
            console.log("Adding track:", track);
            peer.addTrack(track, stream);
        });
    };

    // Handle incoming ICE candidates
    const handleAddIceCandidate = ({ candidate, from }) => {
        console.log("Received ICE candidate from", from);

        // If peer connection is ready to receive candidates
        if (peer.remoteDescription && peer.remoteDescription.type) {
            peer.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(err => console.error("Error adding received ICE candidate", err));
        } else {
            // Store candidates until remote description is set
            console.log("Storing ICE candidate until remote description is set");
            setPendingCandidates(prev => [...prev, candidate]);
        }
    };

    // Track handler for remote streams
    const handleTrackEvent = (e) => {
        console.log("Track event received:", e);
        if (e.streams && e.streams[0]) {
            console.log("Setting remote stream from track event");
            setRemoteStream(e.streams[0]);
        }
    };

    // ICE connection state change handler
    const handleIceConnectionStateChange = () => {
        console.log("ICE connection state:", peer.iceConnectionState);
    };

    // Connection state change handler
    const handleConnectionStateChange = () => {
        console.log("Connection state:", peer.connectionState);
    };

    // Setup peer event listeners
    useEffect(() => {
        // Track events to receive remote stream
        peer.addEventListener('track', handleTrackEvent);

        // ICE candidate events
        peer.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
                console.log("New local ICE candidate:", event.candidate);

                // Send the candidate to the other peer via signaling server
                if (clients.length > 1) {
                    const targetClient = clients.find(client => client.socketId !== socket.id);
                    if (targetClient) {
                        socket.emit(ACTIONS.ICE_CANDIDATE, {
                            candidate: event.candidate,
                            to: targetClient.socketId
                        });
                    }
                }
            }
        });

        // Add monitoring for connection states
        peer.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
        peer.addEventListener('connectionstatechange', handleConnectionStateChange);

        // Socket event for ICE candidates
        if (socket) {
            socket.on(ACTIONS.ADD_ICE_CANDIDATE, handleAddIceCandidate);
        }

        return () => {
            peer.removeEventListener('track', handleTrackEvent);
            peer.removeEventListener('icecandidate', () => { });
            peer.removeEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
            peer.removeEventListener('connectionstatechange', handleConnectionStateChange);

            if (socket) {
                socket.off(ACTIONS.ADD_ICE_CANDIDATE, handleAddIceCandidate);
            }
        };
    }, [peer, socket, clients]);

    return (
        <PeerContext.Provider value={{
            peer,
            createOffer,
            createAnswer,
            setRemoteAnswer,
            sendStream,
            remoteStream
        }}>
            {children}
        </PeerContext.Provider>
    );
};

export const usePeer = () => useContext(PeerContext);