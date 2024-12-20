import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './PlayersPage.css'; // Import CSS for styling

const backendUrl = 'https://auction-backend-d0xr.onrender.com';
const socket = io(backendUrl);

function PlayersList() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/all-players`)
      .then(res => res.json())
      .then(data => setPlayers(data));

    socket.on('bidUpdate', ({ allPlayers }) => {
      setPlayers(allPlayers);
    });

    socket.on('auctionEnd', () => {
      alert('Auction Ended!');
    });

    return () => {
      socket.off('bidUpdate');
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