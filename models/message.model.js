const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    dateSent: {
        type: Date,
        required: true,
        default: new Date().toISOString(),
    },
    ipAddress: {
        type: String,
        required: true,
    },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
