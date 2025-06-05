import React, { useState, useEffect } from 'react';
import ChatRoom from './ChatRoom';

export default function App() {
  const [name, setName] = useState('');
  const [enteredName, setEnteredName] = useState('');
  const [role, setRole] = useState('user'); // You can change default role or get it from input

  useEffect(() => {
    const storedName = localStorage.getItem('name');
    const storedRole = localStorage.getItem('role');
    if (storedName) setName(storedName);
    if (storedRole) setRole(storedRole);
  }, []);

  const handleNameSubmit = () => {
    if (enteredName.trim()) {
      const finalName = enteredName.trim();
      setName(finalName);
      localStorage.setItem('name', finalName);
      localStorage.setItem('role', role);
    } else {
      alert('Please enter your name.');
    }
  };

  if (!name) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Enter Your Name</h2>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Your Name"
            value={enteredName}
            onChange={(e) => setEnteredName(e.target.value)}
          />
          
          <button
            onClick={handleNameSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md transition"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return <ChatRoom name={name} role={role} />;
}
