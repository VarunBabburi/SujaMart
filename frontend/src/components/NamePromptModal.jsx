import React, { useState } from "react";

function NamePromptModal({ show, onSubmit, onClose }) {
  const [name, setName] = useState("");

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dynamic Keyframe Animation Styles */}
      <style>{`
        @keyframes monkeySwing {
          0% { transform: rotate(-8deg) translateY(0px); }
          50% { transform: rotate(10deg) translateY(3px); }
          100% { transform: rotate(-8deg) translateY(0px); }
        }
        @keyframes leafSway {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(12deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-monkey-swing {
          transform-origin: top center;
          animation: monkeySwing 2.5s ease-in-out infinite;
        }
        .animate-leaf-sway {
          transform-origin: bottom left;
          animation: leafSway 3s ease-in-out infinite;
        }
      `}</style>

      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-200">
        
        {/* Monkey Branch & Speech Bubble Assembly */}
        <div className="relative w-full flex justify-center mb-[-24px] z-20">
          
          {/* Hanging Monkey & Wood Branch Illustration */}
          <div className="relative flex items-center justify-center">
            {/* Wooden Branch across top */}
            <div className="absolute -top-3 right-4 w-52 h-3 bg-[#8B5A2B] rounded-full border-2 border-[#5c3a19] shadow-md transform rotate-[-4deg]">
              {/* Animated Leaves */}
              <div className="absolute -left-4 -top-4 text-emerald-600 text-3xl animate-leaf-sway">🍃</div>
              <div className="absolute left-4 -top-5 text-emerald-500 text-xl animate-leaf-sway">🌱</div>
            </div>

            {/* Speech Bubble */}
            <div className="mr-8 relative bg-[#FCECDD] border-2 border-[#D9A276] text-[#6A3816] px-5 py-3 rounded-3xl shadow-lg max-w-[190px] text-center">
              <p className="text-sm font-black leading-tight">
                Hey Cutie!
              </p>
              <p className="text-sm font-black leading-tight">
                What's your name?
              </p>
              {/* Bubble Pointer Tail */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[10px] border-l-[#FCECDD]" />
            </div>

            {/* Hanging & Swinging Monkey Vector Icon */}
            <div className="text-6xl filter drop-shadow-md animate-monkey-swing cursor-pointer">
              🐒
            </div>
          </div>
        </div>

        {/* Input Card Component */}
        <div className="bg-[#FCECDD] border-2 border-[#D9A276] rounded-3xl p-3 pt-6 shadow-2xl w-[260px] text-center">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-[#E8C5A5] shadow-inner">
            <input
              type="text"
              placeholder="Your name"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent px-3 py-1.5 text-xs text-[#5c3a19] placeholder-[#bfa58d] font-bold focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#9E5D32] hover:bg-[#854b25] text-white text-xs font-black px-4 py-2 rounded-xl transition-transform active:scale-95 shadow-sm uppercase tracking-wider"
            >
              GO
            </button>
          </form>
        </div>

        {/* Optional Skip / Close Button */}
        <button
          onClick={onClose}
          className="mt-4 text-xs font-bold text-white/80 hover:text-white bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default NamePromptModal;