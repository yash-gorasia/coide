import React, { useState } from 'react';
import { useFiles } from '../Context/FileContext';
import { 
    FaFile, 
    FaPlus, 
    FaTrash, 
    FaEdit, 
    FaFolder,
    FaChevronDown,
    FaChevronRight 
} from 'react-icons/fa';

const FileExplorer = () => {
    const {
        files,
        activeFile,
        createFile,
        deleteFile,
        renameFile,
        openFile,
        loading
    } = useFiles();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [editingFileId, setEditingFileId] = useState(null);
    const [editFileName, setEditFileName] = useState('');

    const handleCreateFile = async (e) => {
        e.preventDefault();
        if (!newFileName.trim()) return;

        const language = getLanguageFromFileName(newFileName);
        const success = await createFile(newFileName.trim(), language);
        
        if (success) {
            setNewFileName('');
            setShowCreateModal(false);
        }
    };

    const handleRename = async (fileId) => {
        if (!editFileName.trim()) {
            cancelEditing();
            return;
        }
        
        // Prevent duplicate calls
        if (editingFileId !== fileId) return;
        
        const success = await renameFile(fileId, editFileName.trim());
        
        if (success) {
            setEditingFileId(null);
            setEditFileName('');
        }
    };

    const handleDelete = async (fileId, fileName) => {
        if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
            await deleteFile(fileId);
        }
    };

    const startEditing = (file) => {
        setEditingFileId(file._id);
        setEditFileName(file.fileName);
    };

    const cancelEditing = () => {
        setEditingFileId(null);
        setEditFileName('');
    };

    const getLanguageFromFileName = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'kt': 'kotlin',
            'swift': 'swift',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown'
        };
        return languageMap[extension] || 'plaintext';
    };

    const getFileIcon = () => {
        return <FaFile className="text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
                <div className="text-gray-400">Loading files...</div>
            </div>
        );
    }

    return (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center text-gray-300 hover:text-white"
                >
                    {isCollapsed ? <FaChevronRight className="mr-2" /> : <FaChevronDown className="mr-2" />}
                    <FaFolder className="mr-2" />
                    <span className="text-sm font-medium">Files</span>
                </button>
                
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-gray-400 hover:text-white"
                    title="New File"
                >
                    <FaPlus />
                </button>
            </div>

            {/* File List */}
            {!isCollapsed && (
                <div className="flex-1 overflow-y-auto">
                    {files.length === 0 ? (
                        <div className="p-4 text-gray-400 text-sm text-center">
                            No files yet.
                            <br />
                            Click + to create one.
                        </div>
                    ) : (
                        <div className="p-2">
                            {files.map((file) => (
                                <div
                                    key={file._id}
                                    className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                        activeFile?._id === file._id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                    onClick={() => openFile(file)}
                                >
                                    <div className="flex items-center flex-1 min-w-0">
                                        <span className="mr-2">{getFileIcon()}</span>
                                        {editingFileId === file._id ? (
                                            <input
                                                value={editFileName}
                                                onChange={(e) => setEditFileName(e.target.value)}
                                                onBlur={(e) => {
                                                    // Don't trigger rename if Enter was just pressed
                                                    if (!e.relatedTarget || e.relatedTarget.tagName !== 'INPUT') {
                                                        handleRename(file._id);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        e.target.blur();
                                                        handleRename(file._id);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        e.preventDefault();
                                                        cancelEditing();
                                                    }
                                                }}
                                                className="flex-1 bg-gray-600 text-white px-1 rounded text-sm focus:outline-none"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className="text-sm truncate">{file.fileName}</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing(file);
                                            }}
                                            className="text-gray-400 hover:text-white"
                                            title="Rename"
                                        >
                                            <FaEdit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(file._id, file.fileName);
                                            }}
                                            className="text-gray-400 hover:text-red-400"
                                            title="Delete"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create File Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-80">
                        <h3 className="text-lg font-semibold text-white mb-4">Create New File</h3>
                        <form onSubmit={handleCreateFile}>
                            <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder="Enter file name (e.g., script.js)"
                                className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewFileName('');
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;