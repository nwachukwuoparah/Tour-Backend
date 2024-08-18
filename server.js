const mongoose = require("mongoose");
const app = require("./app");
const http = require('http');
const socketIo = require('socket.io');
const dotenv =require('dotenv') // Load environment variables from .env file

// Create an HTTP server with the Express app
const server = http.createServer(app);

// Initialize socket.io with the server 
const io = socketIo(server);

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", err => {
  console.log(err.name, err.message); 
  console.log("UNCAUGHT EXCEPTION!"); 
  process.exit(1);  
});  

const DB = process.env.DATA_BASE  
// .replace('<PASSWORD>', process.env.DATA_BASE_PASSWORD);
 
console.log("run",DB);  
 
mongoose 
  .connect(DB, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }) 
  .then(() => console.log('DB connection successful!'))
  .catch(err => {
    console.log("DB connection error:", err.message);
    process.exit(1);
  });

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected to mock server');
  // Send a success message to the client upon connection
  socket.emit('connection-success', { message: 'Successfully connected to mock server' });

  // Listen for 'rider' event
  socket.on('rider', (data) => {
    console.log('Mock rider message received:', data);
    io.emit('rider-message', data); // Broadcast the rider message to all connected clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION!");
  server.close(() => {
    process.exit(1);
  });
});