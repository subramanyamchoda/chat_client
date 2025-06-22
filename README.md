# 💬 PandaChats – Real-Time Chat App 🐼⚡

**PandaChats** is a modern, full-stack real-time chat application built with the **MERN stack** and **Socket.IO**, offering one-to-one and group messaging, media sharing, and live user presence — all wrapped in a smooth, responsive UI.

---

## 🔗 Live Demo & Links

* 🚀 **Live App**: [https://pandachats.vercel.app](https://pandachats.vercel.app)
* ⚙️ **Backend API**: [https://chat-5km8.onrender.com](https://chat-5km8.onrender.com)
* 💻 **Frontend Repo**: [https://github.com/subramanyamchoda/chat\_client](https://github.com/subramanyamchoda/chat_client)
* 🛠️ **Backend Repo**: [https://github.com/subramanyamchoda/chat\_backend](https://github.com/subramanyamchoda/chat_backend)
* 👤 **Developer Profile**: [https://www.linkedin.com/in/subramanyamchoda/](https://www.linkedin.com/in/subramanyamchoda/)

🎥 **Watch the demo** for a full walkthrough of live messaging, media sharing, and user tracking.

---

## ✨ Key Features

### 💬 Messaging & Chat

* 🔁 **One-to-One & Group Chats**
* ⚡ **Real-Time Messaging** via WebSockets
* ✍️ **Typing Indicators**
* 🔔 **Online/Offline Notifications**

### 📂 Media & File Sharing

* 📸 Share **images, videos, and files**
* 📥 Download shared media effortlessly

### 👥 Real-Time Presence

* 👀 Display **currently online users**
* 🎯 **Live status**: User connected/disconnected

### 😄 Expressive Chat

* ❤️ Emoji support and **message reactions**
* ✅ Instant delivery feedback

---

## 🛠️ Tech Stack

| Layer      | Stack                           |
| ---------- | ------------------------------- |
| Frontend   | React.js + Tailwind CSS         |
| Backend    | Node.js + Express.js            |
| Real-time  | Socket.IO (WebSocket layer)     |
| Database   | MongoDB Atlas                   |
| Deployment | Vercel (Frontend), Render (API) |

---

## 🚀 Getting Started

### 🔧 1. Clone Repositories

```bash
# Client
git clone https://github.com/subramanyamchoda/chat_client.git
cd chat_client
npm install

# Server
git clone https://github.com/subramanyamchoda/chat_backend.git
cd chat_backend
npm install
```

### 🛠️ 2. Set Environment Variables

#### 📁 Backend `.env`

```env
PORT=5000
MONGO_URI=your-mongo-uri
JWT_SECRET=your-secret-key
```

#### 📁 Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

> ⚠️ Replace values with your actual credentials.

### ▶️ 3. Start the App

```bash
# Backend
npm run dev

# Frontend (in separate terminal)
npm run dev
```

Visit: `http://localhost:5173` to start chatting!

---

## 🧪 Real-Time Architecture

PandaChats utilizes **Socket.IO** for WebSocket communication:

* Live chat events (`message`, `typing`, `disconnect`, etc.)
* Efficient data sync between client and server
* Lightweight message flow optimized for real-time UX

---

## 🤝 Contributing

```bash
# Fork the repo
# Create a new branch
git checkout -b feature/YourFeature

# Make your changes and commit
git commit -m "Add YourFeature"

# Push to your fork
git push origin feature/YourFeature

# Open a Pull Request
```

---

## 🙌 Acknowledgments

This project was designed to gain hands-on experience with:

* 🔄 WebSockets & real-time data flow
* 📡 Socket.IO architecture & connection handling
* 🧱 MERN stack integration with deployment
* 🧑‍💻 Full-stack authentication & media transfer
* ☁️ Cloud deployment with Vercel + Render

---

## ✅ Try It Live

👉 App: [https://pandachats.vercel.app](https://pandachats.vercel.app)
👉 API: [https://chat-5km8.onrender.com](https://chat-5km8.onrender.com)

---

Thanks for checking out **PandaChats**! 🎉
Feel free to ⭐ the repo, try it out, and connect on [LinkedIn](https://www.linkedin.com/in/subramanyamchoda/) 🌱✨
