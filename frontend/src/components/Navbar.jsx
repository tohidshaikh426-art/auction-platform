import React from "react";

const Navbar = ({ role, onLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-800 text-white shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-lg flex items-center gap-2">
          <span className="inline-block bg-blue-700 rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2' /></svg></span>
          HOUSE OF WOLVES
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-base font-semibold bg-blue-700/80 px-3 py-1 rounded-xl shadow">
            Role: <span className="capitalize">{role}</span>
          </span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-xl text-base font-bold shadow-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
