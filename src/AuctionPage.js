import React, { useState, useEffect } from 'react';
import './AuctionPage.css';
import Alert from '@mui/material/Alert';

const backendUrl = 'https://auction-backend-d0xr.onrender.com';

const AuctionPage = ({ socket }) => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [auctionData, setAuctionData] = useState(null);
  const [bids, setBids] = useState({});
  const [error, setError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [canPass, setCanPass] = useState(true);

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

  useEffect(() => {
    fetch(`${backendUrl}/players`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setPlayersLoaded(true);
      });
    socket.emit('getAuctionData');

    socket.on('passAvailability', ({ canPass }) => {
        setCanPass(canPass);
    });

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
      setAuctionData(null);
    });

    socket.on('errorMessage', (message) => {
      console.log("This is error message", message);
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socket.off('auctionStart');
      socket.off('bidUpdate');
      socket.off('nextPlayer');
      socket.off('auctionEnd');
      socket.off('errorMessage');
    };
  }, [socket]);

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
                <h4 className="team-title">
                    {TEAM_MAP[captain.name] || "Unknown Team"}
                  </h4>
                  <p className="captain-subtitle">
                    ({captain.name})
                  </p>
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
          <div className="buttons-container">
              <button className="pass-player-button"
                onClick={handlePassPlayer}
                disabled={!canPass}>
                Pass Player
              </button>
          </div>
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
