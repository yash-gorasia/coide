import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useSocket } from "../Context/SocketContext"; // Import useSocket
import ACTIONS from "../Constants/socketEvents";

const CodeEditorWindow = ({ code, onChange, language, theme }) => {
  const [value, setValue] = useState(code || "");
  const { socket } = useSocket(); // Get the socket from context
  const roomId = localStorage.getItem("room-id");

  useEffect(() => {
    setValue(code);
  }, [code]);

  // Emit changes when code is updated
  const handleEditorChange = (newValue) => {
    if (!socket) return; // Check if socket is available
    setValue(newValue);
    onChange("code", newValue);

    if (socket) {
      socket.emit(ACTIONS.CODE_CHANGE, { roomId, code: newValue });
    }
  };

  // Listen for incoming code changes from other users
  useEffect(() => {
    if (!socket) return; // Check if socket is available
    if (socket) {
      socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        setValue(code);
      });

      // Listen for SYNC_CODE event when a user joins
      socket.on(ACTIONS.SYNC_CODE, ({ code }) => {
        console.log("Received SYNC_CODE event with code:", code);
        setValue(code);
      });
    }

    return () => {
      if (socket) {
        socket.off(ACTIONS.CODE_CHANGE);
        socket.off(ACTIONS.SYNC_CODE);
      }
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
        defaultValue={code || "// Write your code here"}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditorWindow;
