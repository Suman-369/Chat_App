const express = require("express");

const authMiddleWare = require("../middleware/auth.middleware");
const chatController = require("../controller/chat.controller");
const router = express.Router();

//chat api
router.post("/", authMiddleWare.authUser, chatController.createChat);
router.get("/", authMiddleWare.authUser, chatController.getChats);
router.get("/messages/:id", authMiddleWare.authUser, chatController.getMessages);

module.exports = router;
