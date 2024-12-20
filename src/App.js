import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AuctionPage from './AuctionPage';
import Dashboard from './Dashboard';
import PlayersPage from './PlayersPage';
import './App.css'; // Import CSS for styling
import io from 'socket.io-client';

const backendUrl = 'https://auction-backend-d0xr.onrender.com';
console.log("Logging the backend url", backendUrl)

const socket = io(backendUrl, {
    transports: ['websocket', 'polling'], // Ensure compatibility
    withCredentials: true, // Send credentials with cross-origin requests
});

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Dashboard</Link> | <Link to="/players">List of Players</Link> | <Link to="/admin" className='.hidden-link'>Admin Panel</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard socket={socket} />} />
          <Route path="/admin" element={<AuctionPage socket={socket} />} />
          <Route path="/players" element={<PlayersPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;