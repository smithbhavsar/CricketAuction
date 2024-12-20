import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ socket }) => {
  const [players, setPlayers] = useState([]);
  const [auctionData, setAuctionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [auctionEnded, setAuctionEnded] = useState(false); // Auction end state
  const [playersLoaded, setPlayersLoaded] = useState(false); // State to track if players data is loaded

  // Fetch players data initially
  useEffect(() => {
    // Fetch players data
    fetch('http://localhost:3001/players')
      .then(res => res.json())
      .then(data => {
        setPlayers(data); // Set players data once fetched
        setPlayersLoaded(true); // Set playersLoaded to true once players data is loaded
        console.log("I have players data:", data); // Log the players data for debugging
      });

    // Initialize socket listeners
    socket.emit('getAuctionData'); // Request auction data on page load

    socket.on('auctionStart', (data) => {
      setAuctionData(data); // Update auction data when auction starts
      setIsLoading(false); // Stop loading once auction data is fetched
    });

    socket.on('bidUpdate', (data) => {
      setAuctionData(data); // Update auction data on bid update
    });

    socket.on('nextPlayer', (player) => {
      setAuctionData((prevData) => ({
        ...prevData,
        currentPlayer: player, // Update current player info
      }));
    });

    socket.on('auctionEnd', () => {
      setAuctionEnded(true); // Mark auction as ended
      setAuctionData(null); // Optionally clear auction data after auction ends
    });

    // Cleanup socket listeners when component is unmounted
    return () => {
      socket.off('auctionStart');
      socket.off('bidUpdate');
      socket.off('nextPlayer');
      socket.off('auctionEnd');
    };
  }, [socket]); // Ensure effect runs when the socket changes

  if (isLoading || !playersLoaded) {
    return <p>Loading auction and player data...</p>; // Show loading state if auction data or players data is not ready
  }

  return (
    <div className="dashboard">
      <h2>Indraprasth Premier League Auction 2024</h2>

      {auctionEnded && (
        <div className="auction-ended-banner">
          <h1>Auction Ended</h1>
          <p>Thank you for participating!</p>
        </div>
      )}

      {auctionData ? (
        <>
          <div className="current-player">
            <h3>Current Player</h3>
            {auctionData.currentPlayer ? (
              <>
                <p><strong>Name:</strong> {auctionData.currentPlayer.name}</p>
                <p><strong>Age:</strong> {auctionData.currentPlayer.age}</p>
                <p><strong>House:</strong> {auctionData.currentPlayer.house}</p>
              </>
            ) : (
              <p>Waiting for player...</p>
            )}
          </div>

          <div className="live-feed">
            <h3>Live Auction Feed</h3>
            <ul>
              {auctionData.captains.map((captain) => (
                <li key={captain.id}>
                  <strong>{captain.name}:</strong> {captain.team.length} Players
                  <ul>
                    {captain.team.map((player, idx) => (
                      <li key={idx}>
                        {player.player.name} - {player.bid} Points
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          <div className="teams">
            <h3>Remaining Points</h3>
            {auctionData.captains.map((captain) => (
              <div key={captain.id}>
                {captain.name} - {captain.points} Points Left to buy {6 - captain.team.length} more players
              </div>
            ))}
          </div>
        </>
      ) : (
        !auctionEnded && <p>Loading auction data...</p>
      )}
    </div>
  );
};

export default Dashboard;
