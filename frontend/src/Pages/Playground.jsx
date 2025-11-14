import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ActiveUsers from '../Components/ActiveUsers'
import CodeEditorWindow from '../Components/CodeEditorWindow'
import FileExplorer from '../Components/FileExplorer'
import LanguagesDropdown from '../Components/LanguagesDropdown'
import { languageOptions } from '../Constants/languageOptions'
import ThemeDropdown from '../Components/ThemeDropdown'
import { defineTheme } from '../Lib/defineTheme'
import OutputWindow from '../Components/OutputWindow'
import OutputDetails from '../Components/OutputDetails'
import { toast } from 'react-toastify'
import { useSocket } from '../Context/SocketContext'
import { useFiles } from '../Context/FileContext'
import ACTIONS from '../Constants/socketEvents'

const javascriptDefault = `// Write your code here\nconsole.log("Hello World!");`

const Playground = () => {
  const { socket } = useSocket();
  const { activeFile, updateFile } = useFiles();
  const roomId = localStorage.getItem("room-id")
  const username = localStorage.getItem("username")
  
  // Use active file content or default
  const [code, setCode] = useState(activeFile?.content || javascriptDefault)
  const [language, setLanguage] = useState(languageOptions[0])
  const [theme, setTheme] = useState("Oceanic Next")
  const [processing, setProcessing] = useState(false)
  const [outputDetails, setOutputDetails] = useState(null);

  const navigate = useNavigate();

  if (!roomId || !username) {
    navigate('/')
  }

  // Update code when active file changes
  useEffect(() => {
    if (activeFile) {
      setCode(activeFile.content || '');
      
      // Set language based on file
      const fileLanguage = languageOptions.find(lang => 
        lang.value === activeFile.language
      );
      if (fileLanguage) {
        setLanguage(fileLanguage);
      }
    }
  }, [activeFile]);

  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
    };
    const options = {
      method: "POST",
      url: import.meta.env.VITE_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);

          toast.error(`Quota of 100 requests exceeded for the Day!`, 10000);
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: import.meta.env.VITE_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        socket.emit(ACTIONS.CODE_EXECUTION_RESULT, {
          roomId,
          outputDetails: response.data
        });
        toast.success(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      toast.error(`Error: ${err.message}`);
    }
  };

  const onChange = async (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        
        // Save to active file if one is selected
        if (activeFile) {
          await updateFile(activeFile._id, data, activeFile.language);
        }
        
        // Emit socket event for real-time sync
        if (socket) {
          socket.emit(ACTIONS.CODE_CHANGE, { roomId, code: data });
        }
      }
        break;
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  }

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  const handleThemeChange = (th) => {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme); // Directly set for default themes
    } else {
      defineTheme(theme.value)
        .then((_) => {
          setTheme(theme); // Update state after theme is defined
        })
        .catch((error) => {
          console.error("Error loading theme:", error);
        });
    }
  };

  useEffect(() => {
    defineTheme("oceanic-next").then((_) => {
      //  monaco.editor.defineTheme("oceanic-next");
      setTheme({ value: "oceanic-next", label: "Oceanic Next" });
    });

  }, []);

  useEffect(() => {
    if (!socket) return; // Check if socket is available

    socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      setCode(code);
    });

    // Listen for code execution results from other users
    socket.on(ACTIONS.CODE_EXECUTION_RESULT, ({ outputDetails }) => {
      setOutputDetails(outputDetails);
      toast.info("Code execution results received from another user");
    });

    return () => {
      if (socket) {
        socket.off(ACTIONS.CODE_CHANGE);
        socket.off(ACTIONS.CODE_EXECUTION_RESULT);
      }
    }
  }, [socket]);

  // In your Playground.jsx, modify the return statement to look like this:
  return (
    <div className="flex h-screen bg-zinc-900">
      {/* File Explorer Sidebar */}
      <FileExplorer />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">
              {activeFile ? activeFile.fileName : 'No file selected'}
            </h1>
            <div className="flex space-x-2">
              <LanguagesDropdown onSelectChange={onSelectChange} />
              <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCompile}
              disabled={!code || processing || !activeFile}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
                !code || processing || !activeFile
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-500 shadow-md hover:shadow-lg"
              }`}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
          </div>
        </div>

        {/* Editor and Output Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            {activeFile ? (
              <CodeEditorWindow
                code={code}
                onChange={onChange}
                language={language?.value}
                theme={theme.value}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-800 text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No file selected</h3>
                  <p className="text-sm">Create a new file or select an existing one from the sidebar</p>
                </div>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="w-1/3 flex flex-col border-l border-gray-700">
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <h2 className="text-lg font-semibold text-white">Output</h2>
            </div>
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
              <div className="flex-1 min-h-0">
                <OutputWindow outputDetails={outputDetails} />
              </div>
              {outputDetails && (
                <div className="flex-shrink-0">
                  <OutputDetails outputDetails={outputDetails} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Users - Bottom Left, aligned with File Explorer */}
        <div className="absolute bottom-0 left-0 z-10">
          <ActiveUsers />
        </div>
      </div>
    </div>
  );
}

export default Playground