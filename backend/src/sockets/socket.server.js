const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { response } = require("express");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? "https://chat-app-u7gk.onrender.com" : "http://localhost:5173",
      credentials: true,
    },
  });

  // create a middleware for socket connecton
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    if (!cookies.token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      //store the user input

      /*
     const message =  await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      });

      const vectors = await aiService.generateVector(messagePayload.content) */

      const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: messagePayload.content,
          role: "user",
        }),
        aiService.generateVector(messagePayload.content),
      ]);

      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      /*
      const memory = await queryMemory({
        queryvector: vectors,
        limit: 3,
        metadata: {
          user: socket.user._id,
        },
      });

      //create a shortterm memory

      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();
*/

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryvector: vectors,
          limit: 3,
          metadata: {
            user: socket.user._id,
          },
        }),
        messageModel
          .find({ chat: messagePayload.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((messages) => messages.reverse()),
      ]);

      // ChatHistory  Create

      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [
            {
              text: item.content,
            },
          ],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `these are some previous messages from the chat use them to generate a response
              
              ${memory.map((item) => item.metadata.text).join("\n")}
              `,
            },
          ],
        },
      ];

      const response = await aiService.genarateResponse([...ltm, ...stm]);
      [...ltm, ...stm].map((item) => {
        console.log(item);
      });

      // store the Ai response in the database

      /* const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVector = await aiService.generateVector(response); */

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });

      const [responseMessage, responseVector] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        }),
        aiService.generateVector(response),
      ]);

      await createMemory({
        vectors: responseVector,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });
    });
  });
}
module.exports = initSocketServer;
