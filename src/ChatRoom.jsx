import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { FaRegTrashAlt, FaRegSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { motion } from 'framer-motion';

const ChatRoom = ({ name, role }) => {
  const adRef = useRef(null);
  const socket = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    socket.current = io('https://chat-5km8.onrender.com');

    axios.get('https://chat-5km8.onrender.com/messages')
      .then((res) => setMessages(res.data))
      .catch(console.error);

    socket.current.emit('userConnected', role);

    socket.current.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setReadStatus((prevStatus) => ({ ...prevStatus, [msg._id]: 'sent' }));
    });

    socket.current.on('deleteMessage', (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
    });

    socket.current.on('updateOnlineUsers', (count) => {
      setOnlineUsers(count);
    });

    socket.current.on('userStatus', (msg) => {
      setConnectionStatus(msg);
      setTimeout(() => setConnectionStatus(''), 15000);
    });

    socket.current.on('typing', () => setIsTyping(true));
    socket.current.on('stopTyping', () => setIsTyping(false));

    socket.current.on('readMessage', (messageId) => {
      setReadStatus((prevStatus) => ({ ...prevStatus, [messageId]: 'read' }));
    });

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Adsense error', e);
    }

    const handleTabPress = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        window.open('https://www.google.com/', '_blank');
      }
    };

    const handleF1Press = (event) => {
      if (event.key === 'F1' || event.key === 'Shift') {
        event.preventDefault();
        setIsBlurred(true);
      }
    };

    window.addEventListener('keydown', handleTabPress);
    window.addEventListener('keydown', handleF1Press);

    return () => {
      socket.current.emit('userDisconnected', role);
      socket.current.disconnect();
      socket.current.off();
      window.removeEventListener('keydown', handleTabPress);
      window.removeEventListener('keydown', handleF1Press);
    };
  }, [role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket.current.emit('typing', { sender: name });
    }

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.current.emit('stopTyping', { sender: name });
    }, 1500);
  };

  const sendMessage = () => {
    if (text.trim() || file) {
      const msg = { text: text.trim(), sender: name };

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = reader.result.split(',')[1];
          msg.image = imageData;
          socket.current.emit('sendMessage', msg);
        };
        reader.readAsDataURL(file);
      } else {
        socket.current.emit('sendMessage', msg);
      }

      setText('');
      setFile(null);
      setShowEmojiPicker(false);
    }
  };

  const deleteChatMessage = async (id) => {
    try {
      await axios.delete(`https://chat-5km8.onrender.com/messages/${id}`);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get('https://chat-5km8.onrender.com/files');
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setFiles([]);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post('https://chat-5km8.onrender.com/upload', formData);
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (filename) => {
    window.open(`https://chat-5km8.onrender.com/files/${filename}`, '_blank');
  };

  const handleDeleteFile = async (filename) => {
    try {
      await axios.delete(`https://chat-5km8.onrender.com/files/${filename}`);
      fetchFiles();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <>
          <div
  className={`min-h-screen flex flex-col sm:flex-row bg-gradient-to-br from-indigo-100 to-purple-200 px-4 py-6 sm:px-8 sm:py-10 gap-6 ${
    isBlurred ? 'blur-3xl' : ''
  }`}
>
  {/* Chat Area */}
  <motion.div
    className="w-full sm:w-2/3 max-w-6xl h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Header */}
    <div className="bg-purple-600 text-white text-xl font-semibold py-4 px-6 flex justify-between items-center">
      <span>💬 Chat</span>
      <span className="truncate text-sm font-light">{name}</span>
      <span className="flex items-center gap-2 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            onlineUsers > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`}
        ></span>
        Online: {onlineUsers}
      </span>
    </div>

    {/* Connection status */}
    {connectionStatus && (
      <div className="bg-yellow-100 text-yellow-700 text-center py-1 text-sm">
        {connectionStatus}
      </div>
    )}

    {/* Messages */}
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" aria-live="polite">
      {messages.map((msg) => (
        <motion.div
          key={msg._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex ${msg.sender === name ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs md:max-w-md p-3 rounded-xl shadow ${
              msg.sender === name
                ? 'bg-indigo-100 text-gray rounded-br-none'
                : 'bg-indigo-100 text-gray-800 rounded-bl-none'
            }`}
          >
            <p className="text-sm font-semibold text-purple-700 mb-1">{msg.sender}</p>

            <div className="flex justify-between gap-2 items-start">
              <p className="whitespace-pre-wrap flex-1">{msg.text}</p>
              <small className="text-xs text-gray-500 whitespace-nowrap">
                {msg.createdAt &&
                  new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </small>
              <button
                onClick={() => deleteChatMessage(msg._id)}
                aria-label="Delete"
                className="text-red-400 hover:text-red-600 ml-2"
              >
                <FaRegTrashAlt size={16} />
              </button>
            </div>

            {msg.image && (
              <img
                src={`data:image/png;base64,${msg.image}`}
                alt="Sent"
                className="mt-2 rounded-md max-w-full max-h-52 object-contain"
              />
            )}

            <div className="text-xs text-right text-gray-500 mt-1 select-none">
              {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
              {readStatus[msg._id] === 'read' && (
                <span className="ml-1 text-gray-300">✓✓</span>
              )}
              {readStatus[msg._id] === 'sent' && (
                <span className="ml-1 text-gray-400">✓</span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Typing Indicator */}
    {isTyping && (
      <div className="text-center text-sm text-gray-600 animate-pulse py-2">
        Typing...
      </div>
    )}

    {/* Input Area */}
    <div className="flex items-center gap-2 px-4 py-3 border-t bg-white">
      <button
        onClick={() => setShowEmojiPicker((val) => !val)}
        aria-label="Emoji"
        className="text-2xl text-gray-500 hover:text-purple-600"
      >
        <FaRegSmile />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleTyping}
        placeholder="Type your message..."
        className="flex-grow border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />

      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="hidden"
      />
      <label
        htmlFor="fileInput"
        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-full text-white cursor-pointer"
      >
        📎
      </label>

      <button
        onClick={sendMessage}
        disabled={!text.trim() && !file}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full disabled:opacity-50"
      >
        Send
      </button>
    </div>

    {/* Emoji Picker */}
    {showEmojiPicker && (
      <div className="absolute bottom-24 left-4 z-50">
        <EmojiPicker onEmojiClick={onEmojiClick} />
      </div>
    )}
  </motion.div>

  {/* Shared Files Area */}
  <motion.div
    className="w-full sm:w-1/3 max-w-sm h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="bg-purple-600 text-white text-xl font-semibold py-4 px-6 text-center">
      📁 Shared Files
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {files.length === 0 ? (
        <p className="text-center text-gray-500">No files uploaded yet.</p>
      ) : (
        files.map((file, index) => (
          <div
            key={index}
            className="bg-indigo-50 rounded-lg px-3 py-2 flex justify-between items-center shadow-sm"
          >
            <span className="truncate text-sm font-medium">{file.filename}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(file.filename)}
                className="text-blue-500 hover:text-blue-700"
                title="Download"
              >
                ⬇️
              </button>
              <button
                onClick={() => handleDeleteFile(file.filename)}
                className="text-red-500 hover:text-red-700"
                title="Delete"
              >
                ❌
              </button>
            </div>
          </div>
        ))
      )}
    </div>

    <div className="p-4 border-t">
      <input
        type="file"
        id="uploadFile"
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor="uploadFile"
        className="block text-center py-2 mb-2 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600 transition"
      >
        📎 Select File
      </label>
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  </motion.div>
</div>
 
    </>
  );
};

export default ChatRoom;