import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import axios from "axios";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const SERVER = "https://chat-5km8.onrender.com";
const STUN_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function CallPage({ name }) {
  const [userId, setUserId] = useState(name || "");
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [ringFrom, setRingFrom] = useState(null);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // ---------------- SOCKET INIT ----------------
  useEffect(() => {
    socketRef.current = io(SERVER);
    const s = socketRef.current;

    s.on("connect", () => {
      console.log("socket connected", s.id);

      // ✅ auto register using name
      if (name) {
        s.emit("register", name);
        setUserId(name);
      }
    });

    s.on("registered", () => console.log("registered ack"));

    s.on("incoming-call", async ({ from, offer }) => {
      setTargetId(from);
      setRingFrom(from);
      setStatus("incoming");
      socketRef.current._incomingOffer = offer;
      socketRef.current._incomingFrom = from;
    });

    s.on("call-accepted", async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      startCallTimer();
      setStatus("in-call");
    });

    s.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pcRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    s.on("call-ended", () => cleanupCall(true));

    return () => {
      s.disconnect();
      cleanupCall(false);
    };
  }, [name]);

  // ---------------- CALL FUNCTIONS ----------------
  function createPeerConnection() {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", {
          to: targetId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    return pc;
  }

  async function setupLocalStream() {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    return stream;
  }

  async function callUser() {
    if (!targetId) return alert("Enter friend name");

    await setupLocalStream();
    pcRef.current = createPeerConnection();

    localStreamRef.current.getTracks().forEach((t) =>
      pcRef.current.addTrack(t, localStreamRef.current)
    );

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socketRef.current.emit("call-user", {
      to: targetId,
      from: userId,
      offer,
    });

    setStatus("calling");
  }

  async function acceptCall() {
    await setupLocalStream();
    pcRef.current = createPeerConnection();

    localStreamRef.current.getTracks().forEach((t) =>
      pcRef.current.addTrack(t, localStreamRef.current)
    );

    const offer = socketRef.current._incomingOffer;
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("accept-call", {
      to: socketRef.current._incomingFrom,
      from: userId,
      answer,
    });

    setStatus("in-call");
    startCallTimer();
  }

  function endCall() {
    if (targetId) {
      socketRef.current.emit("end-call", {
        to: targetId,
        from: userId,
      });
    }
    cleanupCall(true);
  }

  function cleanupCall(save) {
    if (pcRef.current) pcRef.current.close();
    pcRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    setStatus("idle");
    stopCallTimer();
    setCallDuration(0);
    setRingFrom(null);

    if (save && startTimeRef.current) {
      const endTime = new Date();

      axios.post(`${SERVER}/api/calls`, {
        callerId: userId,
        receiverId: targetId,
        startTime: startTimeRef.current,
        endTime,
        duration: Math.round((endTime - startTimeRef.current) / 1000),
      }).catch(() => {});
    }
  }

  function startCallTimer() {
    startTimeRef.current = new Date();

    timerIntervalRef.current = setInterval(() => {
      setCallDuration(
        Math.floor((new Date() - startTimeRef.current) / 1000)
      );
    }, 1000);
  }

  function stopCallTimer() {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
  }

  // ---------------- CONTROLS ----------------
  function toggleMute() {
    if (!localStreamRef.current) return;

    localStreamRef.current.getAudioTracks().forEach(
      (t) => (t.enabled = !t.enabled)
    );

    setIsMuted((v) => !v);
  }

  function toggleSpeaker() {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerOn;
      setIsSpeakerOn((v) => !v);
    }
  }

  // ---------------- UI ----------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm text-center"
      >
        <h2 className="text-2xl font-bold text-indigo-600 mb-6">
          Panda Call
        </h2>

        {/* Your Name */}
        <input
          value={userId}
          disabled
          className="w-full px-3 py-2 border rounded-lg text-sm mb-4 bg-gray-100"
        />

        {/* Friend Name */}
        <input
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="friend_name"
          className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
        />

        {/* Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={callUser}
            className="p-4 bg-green-500 text-white rounded-full"
          >
            <Phone />
          </button>

          <button
            onClick={endCall}
            className="p-4 bg-red-500 text-white rounded-full"
          >
            <PhoneOff />
          </button>
        </div>

        {/* Status */}
        <div className="text-gray-600 mb-4">
          Status: <b>{status}</b>
          {status === "in-call" && (
            <span>
              {" "}
              • {Math.floor(callDuration / 60)}:
              {(callDuration % 60).toString().padStart(2, "0")}
            </span>
          )}
        </div>

        {/* Incoming */}
        {status === "incoming" && (
          <div>
            <p>Incoming call from <b>{ringFrom}</b></p>
            <button onClick={acceptCall} className="bg-green-500 p-3 rounded-full text-white m-2">
              <Phone />
            </button>
            <button onClick={endCall} className="bg-red-500 p-3 rounded-full text-white m-2">
              <PhoneOff />
            </button>
          </div>
        )}

        {/* Controls */}
        {status === "in-call" && (
          <div className="flex justify-center gap-6 mt-4">
            <button onClick={toggleMute}>
              {isMuted ? <MicOff /> : <Mic />}
            </button>
            <button onClick={toggleSpeaker}>
              {isSpeakerOn ? <Volume2 /> : <VolumeX />}
            </button>
          </div>
        )}

        <audio ref={remoteAudioRef} autoPlay playsInline />
      </motion.div>
    </div>
  );
}
