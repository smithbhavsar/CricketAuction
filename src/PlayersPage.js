import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './PlayersPage.css'; // Import CSS for styling

const backendUrl = 'https://auction-backend-d0xr.onrender.com';
const socket = io(backendUrl);

function PlayersList() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Fetch all players from the backend on initial load
    fetch(`${backendUrl}/all-players`)
      .then(res => res.json())
      .then(data => setPlayers(data));

    // Listen for bid updates and auction start events from the server
    socket.on('bidUpdate', ({ allPlayers }) => {
      setPlayers(allPlayers); // Update players list when bid update is received
    });

    socket.on('auctionStart', ({ allPlayers }) => {
      setPlayers(allPlayers); // Update players list when auction starts or is reset
    });

    socket.on('auctionEnd', () => {
      alert('Auction Ended!');
    });

    return () => {
      socket.off('bidUpdate');
      socket.off('auctionStart');
      socket.off('auctionEnd');
    };
  }, []);

  return (
    <div className="players-list">
      <h1>Players List</h1>
      <table className="players-table">
        <thead>
          <tr>
            <th>Name</th>
            <th className="mobile-hidden">House</th>
            <th className="mobile-hidden">Age</th>
            <th className="mobile-hidden">Mobile</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.mobile}>
              <td>{player.name}</td>
              <td className="mobile-hidden">{player.house}</td>
              <td className="mobile-hidden">{player.age}</td>
              <td className="mobile-hidden">{player.mobile}</td>
              <td>
                {player.sold ? <span className="sold-status">Sold</span> : <span className="available-status">Available</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayersList;