import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const backendUrl = 'https://auction-backend-d0xr.onrender.com';

const Dashboard = ({ socket }) => {
  const [players, setPlayers] = useState([]);
  const [auctionData, setAuctionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [auctionEnded, setAuctionEnded] = useState(false); // Auction end state
  const [playersLoaded, setPlayersLoaded] = useState(false); // State to track if players data is loaded
  const [bidLimits, setBidLimits] = useState({});
  const MAX_TEAM_SIZE = 7;

  const TEAM_MAP = {
  "Parv Gupta": "Springs Titans",
  "Mukesh Agrawal": "Springs Knight Riders",
  "Dilip Ratwani": "Springs Warriors",
  "Rahul Singhvi": "Springs Squad",
  "Tushar Ghelani": "Springs Avengers",
  "Dinesh Bansal": "Springs Gladiators",
  "Ashok Sharma": "Spring Royals",
  "Atul Narang": "Spring Kings"
};

  // Fetch players data initially
  useEffect(() => {
    // Fetch players data
    fetch(`${backendUrl}/players`)
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

    socket.on('bidLimits', ({ captainId, maxBid }) => {
      setBidLimits(prev => ({
        ...prev,
        [captainId]: maxBid
      }));
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
      socket.off('bidLimits');
    };
  }, [socket]); // Ensure effect runs when the socket changes

  if (isLoading || !playersLoaded) {
    return <p>Loading auction and player data...</p>; // Show loading state if auction data or players data is not ready
  }

  return (
    <div className="dashboard">
      <h2>Riviera Springs Premier League 2026</h2>
      <h5>Dates: 23rd to 25th January</h5>

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
                <p><strong>Skills:</strong> {auctionData.currentPlayer.skills}</p>
                <p><strong>House:</strong> {auctionData.currentPlayer.house}</p>
                <p><strong>Mobile:</strong> {auctionData.currentPlayer.mobile}</p>
              </>
            ) : (
              <p>Waiting for player...</p>
            )}
          </div>

          <div className="live-feed">
            <h3>Live Auction Feed</h3>
            <ul>
              {auctionData.captains.map((captain) => (
                <li key={captain.id} className="live-feed-item">
                  <div className="team-header">
                    <span className="team-name">
                      {TEAM_MAP[captain.name]}
                    </span>
                    <span className="captain-name">
                      ({captain.name})
                    </span>
                  </div>
                
                  <div className="team-meta">
                    {captain.team.length} Players Acquired
                  </div>
                
                  <ul className="team-players">
                    {captain.team.map((player, idx) => (
                      <li key={idx}>
                        <span className="player-name">{player.player.name}</span>
                        <span className="player-bid">₹{player.bid}</span>
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
              <div key={captain.id} className="team-card">
                <div className="team-header">
                  <span className="team-name">
                    {TEAM_MAP[captain.name]}
                  </span>
                  <span className="captain-name">
                    ({captain.name})
                  </span>
                </div>
          
                <div className="team-stats">
                  <div>
                    <strong>₹{captain.points}</strong>
                    <span>Points Left</span>
                  </div>
                  <div>
                    <strong>{MAX_TEAM_SIZE - captain.team.length}</strong>
                    <span>Slots Left</span>
                  </div>
                  <div>
                    <strong>₹{bidLimits[captain.id] ?? 0}</strong>
                    <span>Max Bid</span>
                  </div>
                </div>
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
