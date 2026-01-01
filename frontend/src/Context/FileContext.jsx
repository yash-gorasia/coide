import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSocket } from './SocketContext';
import ACTIONS from '../Constants/socketEvents';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { socket } = useSocket();

    const roomId = localStorage.getItem("room-id");
    const token = localStorage.getItem("token");

    // API headers with authentication
    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    // Fetch files for current room
    const fetchFiles = async () => {
        if (!roomId || !token) return;
        
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/files/room/${roomId}`,
                { headers: getHeaders() }
            );
            
            if (response.data.success) {
                setFiles(response.data.files);
                
                // Set first file as active if no file is selected
                if (response.data.files.length > 0 && !activeFile) {
                    setActiveFile(response.data.files[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    // Create new file
    const createFile = async (fileName, language = 'javascript', content = '') => {
        if (!fileName || !roomId || !token) return;

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/files`,
                { fileName, language, content, roomId },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                const newFile = response.data.file;
                setFiles(prev => [...prev, newFile]);
                setActiveFile(newFile);
                
                // Emit socket event to notify other users
                if (socket) {
                    socket.emit(ACTIONS.FILE_CREATED, { roomId, file: newFile });
                }
                
                toast.success('File created successfully');
                return newFile;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create file';
            toast.error(errorMessage);
            return null;
        }
    };

    // Update file content
    const updateFile = async (fileId, content, language) => {
        if (!fileId || !token) return;

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/files/${fileId}`,
                { content, language },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                const updatedFile = response.data.file;
                
                setFiles(prev => prev.map(file => 
                    file._id === fileId ? updatedFile : file
                ));
                
                if (activeFile?._id === fileId) {
                    setActiveFile(updatedFile);
                }
                
                // Emit socket event to notify other users
                if (socket) {
                    socket.emit(ACTIONS.FILE_UPDATED, { roomId, file: updatedFile });
                }
                
                return updatedFile;
            }
        } catch (error) {
            console.error('Error updating file:', error);
            toast.error('Failed to update file');
            return null;
        }
    };

    // Delete file
    const deleteFile = async (fileId) => {
        if (!fileId || !token) return;

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/files/${fileId}`,
                { headers: getHeaders() }
            );

            if (response.data.success) {
                setFiles(prev => prev.filter(file => file._id !== fileId));
                
                // If deleted file was active, set first remaining file as active
                if (activeFile?._id === fileId) {
                    const remainingFiles = files.filter(file => file._id !== fileId);
                    setActiveFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
                }
                
                // Emit socket event to notify other users
                if (socket) {
                    socket.emit(ACTIONS.FILE_DELETED, { roomId, fileId });
                }
                
                toast.success('File deleted successfully');
                return true;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete file';
            toast.error(errorMessage);
            return false;
        }
    };

    // Open file (set as active)
    const openFile = (file) => {
        setActiveFile(file);
        
        // Emit socket event to notify other users
        if (socket) {
            socket.emit(ACTIONS.FILE_OPENED, { 
                roomId, 
                fileId: file._id, 
                fileName: file.fileName 
            });
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        // Listen for file events from other users
        socket.on(ACTIONS.FILE_CREATED, ({ file, createdBy }) => {
            setFiles(prev => [...prev, file]);
            toast.info(`${createdBy} created file: ${file.fileName}`);
        });

        socket.on(ACTIONS.FILE_UPDATED, ({ file, updatedBy }) => {
            setFiles(prev => prev.map(f => f._id === file._id ? file : f));
            if (activeFile?._id === file._id) {
                setActiveFile(file);
            }
        });

        socket.on(ACTIONS.FILE_DELETED, ({ fileId, deletedBy }) => {
            setFiles(prev => prev.filter(f => f._id !== fileId));
            if (activeFile?._id === fileId) {
                setActiveFile(null);
            }
        });

        socket.on(ACTIONS.FILE_OPENED, ({ fileName, openedBy }) => {
            toast.info(`${openedBy} opened: ${fileName}`);
        });

        return () => {
            socket.off(ACTIONS.FILE_CREATED);
            socket.off(ACTIONS.FILE_UPDATED);
            socket.off(ACTIONS.FILE_DELETED);
            socket.off(ACTIONS.FILE_RENAMED);
            socket.off(ACTIONS.FILE_OPENED);
        };
    }, [socket, activeFile]);

    // Fetch files on component mount
    useEffect(() => {
        fetchFiles();
    }, [roomId, token]);

    const contextValue = {
        files,
        activeFile,
        loading,
        createFile,
        updateFile,
        deleteFile,
        openFile,
        fetchFiles,
        setActiveFile
    };

    return (
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    );
};

export const useFiles = () => {
    const context = useContext(FileContext);
    if (!context) {
        throw new Error('useFiles must be used within a FileProvider');
    }
    return context;
};