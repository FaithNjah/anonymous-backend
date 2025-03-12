const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Message = require("../models/message.model");

router.get("/", (_, res) => {
    res.send("working fine");
});

// Get all user messages using username
router.get("/messages/:username", async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const messages = await Message.find({ user });
    return res.status(200).json({ messages });
});

// send a message to a particular user using username
router.post("/message/:username", async (req, res) => {
    const { username } = req.params;
    const { message, ipAddress } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const newMessage = new Message({
        user,
        message,
        ipAddress,
    });

    await newMessage.save();
    return res.status(200).json({ message: "Message successfully sent!" });
});

// sign up route
router.post("/sign-up", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({
        username: username,
    });
    if (user) return res.status(400).send("User already exists");

    const newUser = new User({
        username: username,
        password: password,
    });

    await newUser.save();
    return res.status(200).json({ message: "Account successfully created!" });
});

// sign in route
router.post("/sign-in", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "username and password not found" });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            // We can use the throw new error to see the error message in the console or use the return. res to see the error message directly at the postman testing phase
            //   throw new Error('wrong username')
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password" });
        }

        // User authenticated successfully
        const messages = await Message.find({user:user})
        var token = user.generateAuthToken();
        console.log(token);
        console.log("Logged in successful");
        res.status(200).json({ message: "login successful", token, user, messages });
    } catch (err) {
        console.log("error during login", err.message);
        res.status(401).json({ message: "invalid credentials" });
    }
});

router.put("/resetpasscode/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const user = await userData.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!user) {
            return res.status(404).json({ message: "user doesnt exist" });
        }
        res.status(200).json({ message: "updated successfully!" });
    } catch (err) {
        console.log("error editing password", err.message);
        res.status(500).json({ message: "internal server error" });
    }
});

module.exports = router;
