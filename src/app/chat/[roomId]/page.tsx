"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, MessageSquare, ImagePlus } from "lucide-react";
import { io, Socket } from "socket.io-client";

export default function ChatRoomPage() {
  const { data: session } = useSession();
  const { roomId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [typing, setTyping] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!session?.user?.id || !roomId) return;

    // Fetch room details and messages
    Promise.all([
      fetch("/api/chat/rooms").then((r) => r.json()),
      fetch(`/api/chat/rooms/${roomId}/messages`).then((r) => r.json()),
    ]).then(([roomsData, messagesData]) => {
      const currentRoom = (roomsData.rooms || []).find((r: any) => r.id === roomId);
      setRoom(currentRoom);
      setMessages(messagesData.messages || []);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }).catch(() => setLoading(false));

    // Connect socket
    const socket = io({ path: "/api/socketio", addTrailingSlash: false });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", roomId);
    });

    socket.on("new-message", (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 50);
    });

    socket.on("user-typing", (data: { userName: string }) => {
      setTyping(`${data.userName} is typing...`);
    });

    socket.on("user-stop-typing", () => {
      setTyping("");
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.disconnect();
    };
  }, [session, roomId, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Emit via socket for real-time
    socketRef.current?.emit("send-message", {
      roomId,
      message: content,
      senderId: session.user.id,
      senderName: session.user.name,
    });

    // Also persist via API
    try {
      await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch {}

    socketRef.current?.emit("stop-typing", { roomId });
    setSending(false);
  };

  const handleTyping = () => {
    socketRef.current?.emit("typing", { roomId, userName: session?.user?.name });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", { roomId });
    }, 2000);
  };

  const otherMembers = room?.members?.filter((m: any) => m.userId !== session?.user?.id) || [];
  const chatTitle = otherMembers.map((m: any) => m.user?.name).join(", ") || "Chat";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Link href="/chat"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h2 className="font-semibold">{chatTitle}</h2>
            {typing && <p className="text-xs text-green-600">{typing}</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                <p>No messages yet. Say hello!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => {
                const isMe = msg.senderId === session?.user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>
                      {!isMe && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">{(msg.senderName || msg.sender?.name || "?")[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        {!isMe && <p className="text-xs text-gray-500 mb-1">{msg.senderName || msg.sender?.name}</p>}
                        <div className={`rounded-2xl px-4 py-2 ${isMe ? "bg-orange-600 text-white" : "bg-white border"}`}>
                          {msg.image && (
                            <img src={msg.image} alt="Shared" className="max-w-[200px] rounded-lg mb-1 cursor-pointer" onClick={() => window.open(msg.image, "_blank")} />
                          )}
                          {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}
                        </div>
                        <p className={`text-xs mt-1 ${isMe ? "text-right" : ""} text-gray-400`}>
                          {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t px-4 py-3">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2">
            <label className="flex items-center cursor-pointer text-gray-400 hover:text-orange-600 transition">
              <ImagePlus className="h-5 w-5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // Convert to base64 data URL for simplicity (production: use upload service)
                  const reader = new FileReader();
                  reader.onload = async () => {
                    const imageUrl = reader.result as string;
                    try {
                      await fetch(`/api/chat/rooms/${roomId}/messages`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: "", image: imageUrl }),
                      });
                    } catch {}
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
            </label>
            <Input
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              placeholder="Type a message..."
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={!newMessage.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
