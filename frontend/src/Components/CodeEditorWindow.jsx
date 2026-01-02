import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useSocket } from "../Context/SocketContext";
import { useFiles } from "../Context/FileContext";
import { toast } from 'react-toastify';
import ACTIONS from "../Constants/socketEvents";

const CodeEditorWindow = ({ code, onChange, language, theme }) => {
  const [value, setValue] = useState(code || "");
  const [isSaving, setIsSaving] = useState(false);
  const { socket } = useSocket();
  const { activeFile, updateFile } = useFiles();
  const roomId = localStorage.getItem("room-id");
  
  // Refs for better state management
  const editorRef = useRef(null);

  useEffect(() => {
    setValue(code);
  }, [code]);

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Real-time code sync without debounce
  const handleEditorChange = (newValue) => {
    if (!newValue && newValue !== "") return;
    
    // Update local state immediately
    setValue(newValue);
    onChange("code", newValue);
    
    // Emit code change in real-time to all connected browsers
    if (socket && roomId) {
      console.log(`Emitting CODE_CHANGE for room ${roomId}, code length: ${newValue.length}`);
      socket.emit(ACTIONS.CODE_CHANGE, { roomId, code: newValue });
    }
  };

  // Manual save function
  const handleSaveFile = async () => {
    if (!activeFile || !activeFile._id) {
      toast.warning('No active file to save');
      return;
    }

    setIsSaving(true);
    try {
      await updateFile(activeFile._id, value, language);
      toast.success('File saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, activeFile, language]);

  // Listen for incoming code changes from other users
  useEffect(() => {
    if (!socket) return;

    // Socket listeners removed - Playground component handles socket events
    // and updates the code prop, which we watch via the useEffect above
    // This prevents race conditions between local and remote updates

    return () => {
      // No cleanup needed since we're not listening here anymore
    };
  }, [socket]);

  return (
    <div className="overlay rounded-md overflow-hidden">
      <Editor
        height="94vh"
        width="100%"
        theme={theme}
        language={language}
        value={value}
        defaultValue="// Write your code here"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: "gutter",
          selectOnLineNumbers: true,
          smoothScrolling: true,
          cursorStyle: "line",
          cursorBlinking: "blink",
          autoIndent: "advanced",
          formatOnType: false, // Disable to prevent cursor jumping
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          contextmenu: true,
          mouseWheelZoom: true,
          multiCursorModifier: "ctrlCmd",
          bracketPairColorization: {
            enabled: true
          },
          // Performance optimizations for fast typing
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false
        }}
      />
    </div>
  );
};

export default CodeEditorWindow;
