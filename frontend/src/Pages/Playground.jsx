import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ActiveUsers from '../Components/ActiveUsers'
import CodeEditorWindow from '../Components/CodeEditorWindow'
import LanguagesDropdown from '../Components/LanguagesDropdown'
import { languageOptions } from '../Constants/languageOptions'
import ThemeDropdown from '../Components/ThemeDropdown'
import { defineTheme } from '../Lib/defineTheme'
import OutputWindow from '../Components/OutputWindow'
import OutputDetails from '../Components/OutputDetails'
import { toast } from 'react-toastify'
import { useSocket } from '../Context/SocketContext'
import ACTIONS from '../Constants/socketEvents'

const javascriptDefault = `// Write your code here\nconsole.log("Hello World!");`

const Playground = () => {
  const { socket } = useSocket();
  const roomId = localStorage.getItem("room-id")
  const username = localStorage.getItem("username")
  const [code, setCode] = useState(javascriptDefault)
  const [language, setLanguage] = useState(languageOptions[0])
  const [theme, setTheme] = useState("Oceanic Next")
  const [processing, setProcessing] = useState(false)
  const [outputDetails, setOutputDetails] = useState(null);

  const navigate = useNavigate();

  if (!roomId || !username) {
    navigate('/')
  }

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

  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
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
    <div className="flex flex-col bg-zinc-900 min-h-screen p-4 relative">
      {/* Main Content Area */}
      <div className="flex flex-1 space-x-4">
        {/* ActiveUsers Sidebar */}
        <div className="w-64 flex-shrink-0 bg-zinc-800 rounded-lg p-4 shadow-md">
          <ActiveUsers />
        </div>

        {/* Code Editor Section */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex space-x-4">
            <LanguagesDropdown onSelectChange={onSelectChange} />
            <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
          </div>
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>

        {/* Output Section */}
        <div className="w-1/4 flex flex-col space-y-4 bg-zinc-800 rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-semibold text-white">Output</h2>
          <OutputWindow outputDetails={outputDetails} />
          <button
            onClick={handleCompile}
            disabled={!code || processing}
            className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-all
                    ${!code || processing
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-500 shadow-md hover:shadow-lg"
              }
                    flex items-center justify-center gap-2`}
          >
            {processing ? (
              <>Processing...</>
            ) : (
              "Compile and Execute"
            )}
          </button>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </div>

  );
}

export default Playground