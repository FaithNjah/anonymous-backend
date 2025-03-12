require("dotenv").config();

const express = require("express");
const {connectToDatabase} = require('./containers/database')
const cors = require('cors');


const app = express();
const port = process.env.PORT || 4555;

app.use(cors({exposedHeader: 'x-auth-token'}))


const route = require('./routes/index');
const { default: mongoose } = require("mongoose");

app.use(express.json())
app.use('/', route);


const startServer = async () => {
    try {
        // Connect to the database first
        await connectToDatabase();

        // Start the server
        app.listen(port, () => {
            console.log(
                `🚀 Server is running on port ${port} in ${app.get("env")} mode`
            );
        });
    } catch (error) {
        console.log("❌ Failed to start the server:", error);
        process.exit(1);
    }
};

startServer()