require('dotenv').config()
const express =  require('express');
const app = express();
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require("body-parser")
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/gh-api.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/gh-api.com/fullchain.pem")
}

console.log(options)

const https = require("https").createServer(options, app);
const http = require("http").createServer(app);
const io = require('socket.io')(https)
const ioHttp = require('socket.io')(http)

// Create connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

//connect
db.connect((err) => {
    if(err){
        throw err;
    }else{
        console.log('Database (' + process.env.DB_DATABASE + ') connection successful.');
    }
});

io.on('connection', (socket) => {
    console.log('User Connected...')
    socket.on('disconnect', () => { 
        console.log('user disconnected');
    });

    socket.on('sent', () => {
        console.log('user sent a message.');
        io.emit('update', {});
        
    });

    socket.on('updated', () => {
        console.log('user updated chats...');
    });
});

ioHttp.on('connection', (socket) => {
    console.log('User Connected...')
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('sent', () => {
        console.log('user sent a message.');
        socket.broadcast.emit('update', {});
    });

    socket.on('updated', () => {
        console.log('user updated chats...');
    });
});

app.get('/chatapp/getChats', (request, response) =>{
    let sql = "SELECT * FROM chats";
    db.query(sql, (err, result) => {
        if(err) throw err;
        response.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL);
        response.send(result);
    });
});

app.get('/chatapp/addChat', (request, response) => {
    let post = {text: request.query.text, sent_by: request.query.sent_by};
    let sql = "INSERT INTO chats SET ?";
    db.query(sql, post, (err, result) => {
        let sendout = {
            chat_id: result.insertId,
            text: post.text,
            sent_by: post.sent_by
        }
        console.log("Added new chat:");
        console.log(sendout);
        response.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL);
        response.send(sendout);
    });
    
});

app.use(bodyParser.urlencoded({ extended: true }));

http.listen('3001', () => {
    console.log("Listening on 3001...")
});

if(!process.env.DEV === false)
{
   https.listen(process.env.PORT || '443');
}
