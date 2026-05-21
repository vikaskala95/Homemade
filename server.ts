import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track online users
const onlineUsers = new Map<string, { socketId: string; userName: string; lastSeen: Date }>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // User comes online
    socket.on("user-online", (data: { userId: string; userName: string }) => {
      onlineUsers.set(data.userId, {
        socketId: socket.id,
        userName: data.userName,
        lastSeen: new Date(),
      });
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      // Notify room members
      socket.to(roomId).emit("user-joined-room", { socketId: socket.id });
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left-room", { socketId: socket.id });
    });

    socket.on("send-message", (data: {
      roomId: string;
      message: string;
      senderId: string;
      senderName: string;
      image?: string;
    }) => {
      io.to(data.roomId).emit("new-message", {
        id: `temp-${Date.now()}`,
        content: data.message,
        senderId: data.senderId,
        senderName: data.senderName,
        image: data.image || null,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("typing", (data: { roomId: string; userName: string }) => {
      socket.to(data.roomId).emit("user-typing", { userName: data.userName });
    });

    socket.on("stop-typing", (data: { roomId: string }) => {
      socket.to(data.roomId).emit("user-stop-typing");
    });

    // Mark messages as read
    socket.on("mark-read", (data: { roomId: string; userId: string }) => {
      socket.to(data.roomId).emit("messages-read", { userId: data.userId });
    });

    socket.on("disconnect", () => {
      // Remove from online users
      for (const [userId, userData] of onlineUsers.entries()) {
        if (userData.socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
      console.log("Client disconnected:", socket.id);
    });
  });

  // Health check endpoint
  httpServer.on("request", (req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        onlineUsers: onlineUsers.size,
      }));
    }
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
