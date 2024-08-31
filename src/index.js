require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./routers/auth.route');
const User = require('./models/user');
const Database = require('./dbConnection');
Database.connect();

const server = express();

server.use(cors());
server.use(express.json());
server.use('/api/auth', authRouter);

server.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`)
});