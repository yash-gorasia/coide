import React, { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useSocket } from "../Context/SocketContext";
import { useFiles } from "../Context/FileContext";
import ACTIONS from "../Constants/socketEvents";

const CodeEditorWindow = ({ code, onChange, language, theme }) => {
  const [value, setValue] = useState(code || "");
  const { socket } = useSocket();
  const { activeFile, updateFile } = useFiles();
  const roomId = localStorage.getItem("room-id");
  
  // Refs for better state management
  const editorRef = useRef(null);
  const isTypingRef = useRef(false);
  const lastUserInputRef = useRef(Date.now());
  const debounceTimerRef = useRef(null);
  const persistenceTimerRef = useRef(null);

  useEffect(() => {
    setValue(code);
  }, [code]);

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Debounced emit function
  const debouncedEmit = useCallback((newValue) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (socket && roomId) {
        console.log(`Emitting CODE_CHANGE for room ${roomId}, code length: ${newValue.length}`);
        socket.emit(ACTIONS.CODE_CHANGE, { roomId, code: newValue });
      }
    }, 300); // Wait 300ms after user stops typing
  }, [socket, roomId]);

  // Debounced database persistence function
  const debouncedPersist = useCallback((newValue) => {
    if (persistenceTimerRef.current) {
      clearTimeout(persistenceTimerRef.current);
    }
    
    persistenceTimerRef.current = setTimeout(() => {
      if (activeFile && activeFile._id && updateFile) {
        updateFile(activeFile._id, newValue, language);
      }
    }, 1000); // Wait 1s after user stops typing before persisting to database
  }, [activeFile, updateFile, language]);

  // Don't listen for socket CODE_CHANGE here - let Playground handle it and pass via props
  // This prevents race conditions and state desync

  // Handle editor changes with better typing detection
  const handleEditorChange = (newValue) => {
    if (!newValue && newValue !== "") return;
    
    // Mark as user typing
    isTypingRef.current = true;
    lastUserInputRef.current = Date.now();
    
    // Update local state immediately
    setValue(newValue);
    onChange("code", newValue);
    
    // Debounce socket emission for real-time updates
    debouncedEmit(newValue);
    
    // Debounce database persistence
    debouncedPersist(newValue);
    
    // Reset typing flag after a delay
    setTimeout(() => {
      isTypingRef.current = false;
    }, 1000);
  };

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
