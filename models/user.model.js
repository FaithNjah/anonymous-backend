const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: Date,
        required: true,
        default: new Date().toISOString(),
    },
    password: {
        type: String,
        required: true,
    },
});

userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { _id: this._id, permission: this.permission },
        process.env.JWT_SECRET
    );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
