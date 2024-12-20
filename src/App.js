import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AuctionPage from './AuctionPage';
import Dashboard from './Dashboard';
import PlayersPage from './PlayersPage';
import './App.css'; // Import CSS for styling
import io from 'socket.io-client';

const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const socket = io(backendUrl);

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Dashboard</Link> | <Link to="/players">List of Players</Link>
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