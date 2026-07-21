import React from "react";

function NetworkError({ onRetry }) {
  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-5xl mb-6">
        📡
      </div>

      <h2 className="text-2xl font-extrabold text-slate-800">
        No Internet Connection
      </h2>

      <p className="text-slate-500 mt-3 max-w-sm">
        We couldn't connect to SujaMart.
        Please check your internet connection and try again.
      </p>

      <button
        onClick={onRetry}
        className="mt-8 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#7A22FD] via-[#D119A5] to-[#FF4E6B] text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
      >
        🔄 Retry
      </button>
    </div>
  );
}

export default NetworkError;