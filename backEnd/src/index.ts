import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { Server } from 'socket.io'
import http from 'http'
dotenv.config();

const port = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:9000', // Replace with your Vue app's URL
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true, // If you need to send cookies
};


const app = express()
app.use(express.json());
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:9000', // Allow your Quasar app origin
        methods: ['GET', 'POST'],
        credentials: true
    }
});



io.on('connect', (socket) => {
    let userName = socket.handshake.auth.userName;
    console.log(`${userName} joined the chat`);

    socket.broadcast.emit("user-joined", `${userName} joined the chat`);

    socket.on("send-message", (message) => {
        socket.broadcast.emit("recieve-message", message);
    });

    socket.on("disconnect", () => {
        console.log(`${userName} left the chat`);
        socket.broadcast.emit("user-left", `${userName} left the chat`);
    });
})

server.listen(port, () => {
    console.log("Server Listening on PORT:", port);
});