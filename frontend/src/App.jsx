import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Playground from './Pages/Playground';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { ToastContainer } from 'react-toastify';
import { SocketProvider } from './Context/SocketContext';
import { FileProvider } from './Context/FileContext';

const App = () => {
  return (
    <>
      <div>
        <ToastContainer />
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/playground/:roomId" element={
            <SocketProvider>
              <FileProvider>
                <Playground />
              </FileProvider>
            </SocketProvider>
          } />
        </Routes>
      </Router>
    </>
  );
};

export default App;
