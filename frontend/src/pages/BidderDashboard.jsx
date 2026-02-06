import React, { useState, useEffect } from "react";
import socket from "../services/socket";
import { FaGavel, FaUserTie, FaClock } from "react-icons/fa";

const BidderDashboard = ({ user }) => {
  const [state, setState] = useState(null);

  const [wallet, setWallet] = useState(10000);
  useEffect(() => {
    socket.emit("join:auction");

    socket.on("auction:state", (data) => {
      setState(data);
    });

    socket.on("bid:placed", (data) => {
      if (data.bidder === user.username) {
        setWallet(data.wallet);
      }
    });

    return () => {
      socket.off("auction:state");
      socket.off("bid:placed");
    };
  }, [user.username]);

  // Calculate next bid amount
  const getNextBid = () => {
    if (!state) return 0;
    if (state.currentBid < 500) return state.currentBid + 50;
    return state.currentBid + 100;
  };

  const placeBid = () => {
    const amount = getNextBid();
    socket.emit("bid:place", { userId: user.id, amount });
  };

  const getCategoryBadgeColor = (category) => {
    return category === "product"
      ? "bg-green-500"
      : "bg-purple-500";
  };

  const getCategoryLabel = (category) => {
    return category === "product" ? "PRODUCT" : "TECH/FEATURE";
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-red-700 to-blue-800">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
          <FaGavel className="mx-auto text-5xl text-red-600 mb-4 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Waiting for auction to start...</h1>
          <p className="text-red-600 mb-4">Please wait for the admin to start the first item.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-700 to-blue-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 mb-8 border-2 border-red-600">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Item Image */}
            <div className="flex-shrink-0 w-48 h-48 bg-gradient-to-br from-red-200 to-blue-400 rounded-xl flex items-center justify-center overflow-hidden">
              {state.image ? (
                <img src={state.image} alt={state.itemName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <FaGavel className="text-7xl text-blue-700" />
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-blue-800">{state.itemName}</h2>
                <span className={`${getCategoryBadgeColor(state.category)} text-white px-4 py-1 rounded-full text-sm font-bold`}>
                  {getCategoryLabel(state.category)}
                </span>
              </div>

              {/* Bid Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base mb-6">
                <div className="flex flex-col items-center bg-blue-50 p-3 rounded-lg">
                  <span className="text-blue-700 text-sm">Current Bid</span>
                  <span className="font-bold text-2xl text-red-600">₹{state.currentBid}</span>
                </div>
                <div className="flex flex-col items-center bg-blue-50 p-3 rounded-lg">
                  <span className="text-blue-700 text-sm">Leading Bidder</span>
                  <span className="font-semibold text-sm flex items-center gap-1 text-blue-800">
                    <FaUserTie /> {state.leadingBidder || "None"}
                  </span>
                </div>
                <div className="flex flex-col items-center bg-blue-50 p-3 rounded-lg">
                  <span className="text-blue-700 text-sm">Bid Count</span>
                  <span className="font-bold text-2xl text-green-600">{state.bids?.length || 0}</span>
                </div>
                <div className="flex flex-col items-center bg-blue-50 p-3 rounded-lg">
                  <span className="text-blue-700 text-sm">Your Wallet</span>
                  <span className="font-bold text-xl text-blue-800">₹{wallet}</span>
                </div>
              </div>

              {/* Timer Display */}
              <div className="bg-gradient-to-r from-red-400 to-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-white text-2xl" />
                    <div>
                      <p className="text-white text-sm">Time Remaining</p>
                      <p className="text-white text-3xl font-bold">{state.timerSeconds}s</p>
                    </div>
                  </div>
                  <div className="w-32 h-32 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeDasharray={`${(state.timerSeconds / 35) * 282.7} 282.7`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {Math.round((state.timerSeconds / 35) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid Button */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={placeBid}
                  className={`px-8 py-3 font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 flex items-center gap-2 text-lg ${
                    state.timerEnd && state.timerSeconds > 0
                      ? "bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-700 hover:to-blue-900 text-white cursor-pointer"
                      : "bg-gray-400 text-white cursor-not-allowed opacity-50"
                  }`}
                  disabled={!state.timerEnd || state.timerSeconds === 0}
                >
                  <FaGavel /> Bid ₹{getNextBid()}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bid History */}
        <div className="bg-gradient-to-br from-blue-100 to-red-100 rounded-xl shadow p-6 border-2 border-red-600">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Bid History ({state.bids?.length || 0})</h2>
          {state.bids && state.bids.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {state.bids.map((b, i) => (
                <li key={i} className="flex justify-between items-center text-sm border-b border-red-100 pb-2">
                  <span className="font-medium text-blue-700">{i + 1}. {b.bidder}</span>
                  <span className="text-blue-800 font-bold">₹{b.amount}</span>
                  <span className="text-blue-500 text-xs">{new Date(b.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-500 text-sm">No bids yet. Be the first to bid!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidderDashboard;
