import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Playground from './Pages/Playground';
import { ToastContainer } from 'react-toastify';
import { SocketProvider } from './Context/SocketContext';

const App = () => {
  return (
    <>
      <div>
        <ToastContainer />
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground/:roomId" element={
            <SocketProvider>
                <Playground />
            </SocketProvider>
          } />
        </Routes>
      </Router>
    </>
  );
};

export default App;
