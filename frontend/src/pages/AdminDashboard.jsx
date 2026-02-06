import React, { useState, useEffect } from "react";
import socket from "../services/socket";
import { FaGavel, FaUserTie, FaClock, FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";

const AdminDashboard = ({ user }) => {
  const [state, setState] = useState(null);
  const [timerFinished, setTimerFinished] = useState(false);
  const [unsoldItemsAvailable, setUnsoldItemsAvailable] = useState(false);

  useEffect(() => {
    socket.emit("join:auction");

    socket.on("auction:state", (data) => {
      setState(data);
      // Reset timer finished when state updates
      if (data.timerSeconds > 0) {
        setTimerFinished(false);
      }
    });

    socket.on("auction:timer:finished", (data) => {
      setTimerFinished(true);
      console.log("Timer finished:", data);
    });

    socket.on("auction:unsold:items:available", (data) => {
      setUnsoldItemsAvailable(true);
      console.log("Unsold items available:", data);
    });

    socket.on("auction:item:marked:sold", (data) => {
      setTimerFinished(false);
      console.log("Item marked as sold:", data);
    });

    socket.on("auction:item:marked:unsold", (data) => {
      setTimerFinished(false);
      console.log("Item marked as unsold:", data);
    });

    socket.on("auction:end", () => {
      setState(null);
    });

    return () => {
      socket.off("auction:state");
      socket.off("auction:timer:finished");
      socket.off("auction:unsold:items:available");
      socket.off("auction:item:marked:sold");
      socket.off("auction:item:marked:unsold");
      socket.off("auction:end");
    };
  }, []);

  const startAuction = () => {
    socket.emit("admin:start");
  };

  const nextItem = () => {
    socket.emit("admin:next");
  };

  const markSold = () => {
    if (state && state.currentItemId && state.leadingBidder) {
      socket.emit("admin:markSold", {
        itemId: state.currentItemId,
        winnerId: state.winnerId,
      });
    }
  };

  const markUnsold = () => {
    if (state && state.currentItemId) {
      socket.emit("admin:markUnsold", {
        itemId: state.currentItemId,
      });
    }
  };

  const startUnsoldAuction = () => {
    socket.emit("admin:start:unsold");
    setUnsoldItemsAvailable(false);
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-red-700 to-blue-800">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
          <FaGavel className="mx-auto text-5xl text-blue-700 mb-4 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Admin Dashboard</h1>
          <p className="text-red-600 mb-4">Waiting for auction to start...</p>
          <button
            onClick={startAuction}
            className="mt-2 px-8 py-3 bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-700 hover:to-blue-900 text-white font-bold rounded-xl shadow-lg transition duration-200"
          >
            <FaArrowRight className="inline mr-2" /> Start Auction
          </button>
        </div>
      </div>
    );
  }

  const getCategoryBadgeColor = (category) => {
    return category === "product"
      ? "bg-green-500"
      : "bg-purple-500";
  };

  const getCategoryLabel = (category) => {
    return category === "product" ? "PRODUCT" : "TECH/FEATURE";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-700 to-blue-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-200 mb-8 text-center drop-shadow-lg">
          Admin Dashboard
        </h1>

        {/* Unsold Items Available Banner */}
        {unsoldItemsAvailable && (
          <div className="mb-6 bg-yellow-400/90 rounded-xl shadow-lg p-6 border-2 border-yellow-600">
            <h3 className="text-2xl font-bold text-yellow-900 mb-3">Unsold Items Available!</h3>
            <p className="text-yellow-800 mb-4">
              There are unsold items ready to be auctioned again.
            </p>
            <button
              onClick={startUnsoldAuction}
              className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition duration-200 flex items-center gap-2"
            >
              <FaArrowRight /> Start Unsold Items Auction
            </button>
          </div>
        )}

        {/* Main Auction Item Card */}
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 mb-8 border-2 border-blue-700">
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
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                  state.status === "active" ? "bg-blue-500 text-white" : "bg-gray-400 text-white"
                }`}>
                  {state.status === "active" ? "ACTIVE" : "PENDING"}
                </span>
              </div>

              {/* Bid Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-base mb-6">
                <div className="flex flex-col items-center bg-blue-50 p-4 rounded-lg">
                  <span className="text-blue-700 text-sm">Current Bid</span>
                  <span className="font-bold text-2xl text-red-600">₹{state.currentBid}</span>
                </div>
                <div className="flex flex-col items-center bg-blue-50 p-4 rounded-lg">
                  <span className="text-blue-700 text-sm">Leading Bidder</span>
                  <span className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                    <FaUserTie /> {state.leadingBidder || "None"}
                  </span>
                </div>
                <div className="flex flex-col items-center bg-blue-50 p-4 rounded-lg">
                  <span className="text-blue-700 text-sm">Bid Count</span>
                  <span className="font-bold text-2xl text-green-600">{state.bids?.length || 0}</span>
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!timerFinished ? (
                  <button
                    onClick={nextItem}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold rounded-xl shadow-lg transition duration-200 flex items-center gap-2"
                  >
                    <FaArrowRight /> Next Item
                  </button>
                ) : (
                  <>
                    <button
                      onClick={markSold}
                      disabled={!state.hasBids}
                      className={`px-6 py-3 font-bold rounded-xl shadow-lg transition duration-200 flex items-center gap-2 ${
                        state.hasBids
                          ? "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white cursor-pointer"
                          : "bg-gray-400 text-white cursor-not-allowed opacity-50"
                      }`}
                    >
                      <FaCheck /> Mark as Sold
                    </button>
                    <button
                      onClick={markUnsold}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-bold rounded-xl shadow-lg transition duration-200 flex items-center gap-2"
                    >
                      <FaTimes /> Mark as Unsold
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bid History */}
        <div className="bg-gradient-to-br from-blue-100 to-red-100 rounded-xl shadow p-6 border-2 border-blue-700">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Bid History ({state.bids?.length || 0})</h2>
          {state.bids && state.bids.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {state.bids.map((b, i) => (
                <li key={i} className="flex justify-between items-center text-sm text-blue-700 border-b border-blue-100 pb-2">
                  <span className="font-medium text-red-600">{i + 1}. {b.bidder}</span>
                  <span className="text-blue-800 font-bold">₹{b.amount}</span>
                  <span className="text-blue-500 text-xs">{new Date(b.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-500 text-sm">No bids yet. Waiting for bidders...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
