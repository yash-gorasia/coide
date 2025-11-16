import React, { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useSocket } from "../Context/SocketContext";
import ACTIONS from "../Constants/socketEvents";

const CodeEditorWindow = ({ code, onChange, language, theme }) => {
  const [value, setValue] = useState(code || "");
  const { socket } = useSocket();
  const roomId = localStorage.getItem("room-id");
  
  // Refs for better state management
  const editorRef = useRef(null);
  const isTypingRef = useRef(false);
  const lastUserInputRef = useRef(Date.now());
  const debounceTimerRef = useRef(null);

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
        socket.emit(ACTIONS.CODE_CHANGE, { roomId, code: newValue });
      }
    }, 300); // Wait 300ms after user stops typing
  }, [socket, roomId]);

  // Handle editor changes with better typing detection
  const handleEditorChange = (newValue) => {
    if (!newValue && newValue !== "") return;
    
    // Mark as user typing
    isTypingRef.current = true;
    lastUserInputRef.current = Date.now();
    
    // Update local state immediately
    setValue(newValue);
    onChange("code", newValue);
    
    // Debounce socket emission
    debouncedEmit(newValue);
    
    // Reset typing flag after a delay
    setTimeout(() => {
      isTypingRef.current = false;
    }, 1000);
  };

  // Listen for incoming code changes from other users
  useEffect(() => {
    if (!socket) return;

    const handleCodeChange = ({ code: incomingCode }) => {
      // Don't update if user is actively typing
      if (isTypingRef.current) {
        return;
      }
      
      // Don't update if the code is the same
      if (incomingCode === value) {
        return;
      }
      
      // Only update if enough time has passed since last user input
      const timeSinceLastInput = Date.now() - lastUserInputRef.current;
      if (timeSinceLastInput < 500) {
        return;
      }
      
      // Store cursor position before update
      const editor = editorRef.current;
      let position = null;
      if (editor) {
        position = editor.getPosition();
      }
      
      // Update the value
      setValue(incomingCode);
      
      // Restore cursor position after a brief delay
      if (editor && position) {
        setTimeout(() => {
          try {
            editor.setPosition(position);
            editor.focus();
          } catch (error) {
            // Ignore position errors if content changed significantly
          }
        }, 50);
      }
    };

    const handleSyncCode = ({ code: syncCode }) => {
      console.log("Received SYNC_CODE event with code:", syncCode);
      setValue(syncCode);
    };

    socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);
    socket.on(ACTIONS.SYNC_CODE, handleSyncCode);

    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      socket.off(ACTIONS.SYNC_CODE, handleSyncCode);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [socket, value]);

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
