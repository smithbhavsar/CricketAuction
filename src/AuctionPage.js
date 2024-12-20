import React, { useState, useEffect } from 'react';
import './AuctionPage.css';
import Alert from '@mui/material/Alert';

const backendUrl = 'https://auction-backend-d0xr.onrender.com';

const AuctionPage = ({ socket }) => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [auctionData, setAuctionData] = useState(null);
  const [bids, setBids] = useState({});
  const [error, setError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
    const [playersLoaded, setPlayersLoaded] = useState(false); // State to track if players data is loaded

  useEffect(() => {
    fetch(`${backendUrl}/players`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data); // Set players data once fetched
        setPlayersLoaded(true); // Set playersLoaded to true once players data is loaded
        console.log("I have players data:", data); // Log the players data for debugging
      });
    socket.emit('getAuctionData');

    socket.on('auctionStart', (data) => {
      setAuctionData(data);
      setIsLoading(false);
    });

    socket.on('bidUpdate', (data) => {
      setAuctionData(data);
    });

    socket.on('nextPlayer', (player) => {
      setAuctionData((prevData) => ({
        ...prevData,
        currentPlayer: player,
      }));
    });

    socket.on('auctionEnd', () => {
      setAuctionEnded(true);
      setAuctionData(null); // Optionally reset auction data
    });

    // Listen for error messages from the server
    socket.on('errorMessage', (message) => {
      console.log("This is error message",message)
      setError(message);
      setTimeout(() => setError(''), 3000); // Clear the error message after 3 seconds
    });

    return () => {
      socket.off('auctionStart');
      socket.off('bidUpdate');
      socket.off('nextPlayer');
      socket.off('auctionEnd');
      socket.off('errorMessage');
    };
  }, [socket]);

  if (isLoading || !playersLoaded) {
    return <p>Loading auction and player data...</p>; // Show loading state if auction data or players data is not ready
  }

  const handleBid = (captainId) => {
    const bidAmount = bids[captainId];
    if (bidAmount && bidAmount >= 50) {
      socket.emit('placeBid', parseInt(bidAmount), captainId);
      setBids((prevBids) => ({
        ...prevBids,
        [captainId]: '',
      }));
    } else {
      setError('Please place a valid bid (multiple of 50 points)');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBidChange = (captainId, value) => {
    setBids((prevBids) => ({
      ...prevBids,
      [captainId]: value,
    }));
  };

  const handlePassPlayer = () => {
    setShowPrompt(true);
  };

  const confirmPassPlayer = () => {
    socket.emit('passPlayer');
    setShowPrompt(false);
  };

  const cancelPassPlayer = () => {
    setShowPrompt(false);
  };

  return (
    <div className="auction-page">
      {auctionEnded && (
        <div className="auction-ended-banner">
          <h1>Auction Ended</h1>
          <p>Thank you for participating!</p>
        </div>
      )}

      {/* Display error alert */}
      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {!auctionEnded && auctionData ? (
        <>
          <h1>Auction Page</h1>
          {auctionData.currentPlayer && (
            <div className="player-details">
              <div>Player: {auctionData.currentPlayer.name}</div>
              <div>House: {auctionData.currentPlayer.house}</div>
              <div>Base Value: {auctionData.currentPlayer.baseValue} Points</div>
            </div>
          )}
          <div className="captain-grid">
            {auctionData.captains.map((captain) => (
              <div key={captain.id} className="captain-card">
                <h4>{captain.name}</h4>
                <p>Points Left: {captain.points}</p>
                <input
                  type="number"
                  value={bids[captain.id] || ''}
                  onChange={(e) => handleBidChange(captain.id, e.target.value)}
                  placeholder="Enter bid"
                  min={50}
                />
                <button onClick={() => handleBid(captain.id)}>Place Bid</button>
                <div className="acquired-players">
                  <h5>Acquired Players:</h5>
                  {captain.team.length > 0 ? (
                    <ol>
                      {captain.team.map((teamMember, index) => (
                        <li key={index}>
                          {teamMember.player.name} - {teamMember.bid} Points
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No players acquired yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="pass-player-button" onClick={handlePassPlayer}>
            Pass Player
          </button>
          {showPrompt && (
            <div className="prompt-overlay">
              <div className="prompt">
                <h3>Are you sure you want to pass this player?</h3>
                <button className="confirm" onClick={confirmPassPlayer}>
                  Yes
                </button>
                <button className="cancel" onClick={cancelPassPlayer}>
                  No
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        !auctionEnded && <p>Loading auction...</p>
      )}
    </div>
  );
};

export default AuctionPage;