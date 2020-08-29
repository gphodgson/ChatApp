require('dotenv').config()
const express =  require('express');
const app = express();
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require("body-parser")

const __dev__= process.env.DEV;

const ssl_key = __dev__ ?  process.env.SSL_KEY : "";
const ssl_chain = __dev__ ? process.env.SSL_CHAIN : "";

var options;
try{
    options = {
        key: fs.readFileSync(ssl_key),
        cert: fs.readFileSync(ssl_chain)
    }
}catch{
    options = {
        key: '',
        cert: ''    
    }
}

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
        console.log(`Database (${process.env.DB_DATABASE}) connection failed.`)
        throw err;
    }else{
        console.log(`Database (${process.env.DB_DATABASE}) connection successful.`);
    }
});

onConnect = (socket) => {
    console.log('User Connected...');

    socket.on('sent', () => {
        if(__dev__) console.log('user sent a message.');
        io.emit('update', {});
    });

    socket.on('updated', () => {
        if(__dev__) console.log('user updated chats...');
    });
}


io.on('connection', (socket) => {
    onConnect(socket);
});

ioHttp.on('connection', (socket) => {
    onConnect(socket);
});

app.get('/chatapp/getChats', (request, response) =>{
    let sql = "SELECT * FROM chats";
    db.query(sql, (err, result) => {
        if(err) throw err;
        
        if(__dev__) console.log(result);

        response.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL);
        response.send(result);
    });
});

app.get('/chatapp/addChat', (request, response) => {
    let post = {text: request.query.text, sent_by: request.query.sent_by};
    let sql = "INSERT INTO chats SET ?";
    db.query(sql, post, (err, result) => {
        if(err) throw err;

        let sendout = {
            chat_id: result.insertId,
            text: post.text,
            sent_by: post.sent_by
        }
        
        if(__dev__) console.log(`Added new chat:\n${sendout}`);

        response.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL);
        response.send(sendout);
    });
    
});

app.use(bodyParser.urlencoded({ extended: true }));

http.listen('3001');

if(!process.env.DEV === false)
{
   https.listen(process.env.PORT || '443');
}
