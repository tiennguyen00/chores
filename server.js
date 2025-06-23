const WebSocketServer = require("ws");
const protobuf = require("protobufjs");

// Load the .proto file
protobuf
  .load("./chat.proto")
  .then((root) => {
    const ChatMessage = root.lookupType("ChatMessage");

    const wss = new WebSocketServer.Server({ port: 5050 }, () => {
      console.log("✅ WebSocket server listening on ws://localhost:5050");
    });

    wss.on("connection", (ws) => {
      console.log("🔗 Client connected: ");

      ws.on("message", (data) => {
        try {
          const message = ChatMessage.decode(new Uint8Array(data));

          // Reply with acknowledgment
          const response = ChatMessage.create({
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            timestamp: message.timestamp,
          });

          // Broadcast to everyone except sender
          wss.clients.forEach((c) => {
            const response = ChatMessage.create({
              senderId: message.senderId,
              senderName: message.senderName,
              content: message.content,
              timestamp: message.timestamp,
            });
            console.log("response: ", response);
            c.send(ChatMessage.encode(response).finish());
          });
          // ws.send(ChatMessage.encode(response).finish());
        } catch (e) {
          console.error("❌ Decode error:", e);
        }
      });

      ws.on("close", () => console.log("❌ Client disconnected"));
    });
  })
  .catch((err) => {
    console.error("❌ Failed to load .proto:", err);
  });
