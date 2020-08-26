const express =  require('express');
const mysql = require('mysql');
const https = require("https")
const fs = require("fs");

const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/gh-api.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/gh-api.com/fullchain.pem")
};

// Create connection
const db = mysql.createConnection({
    host: 'mysql.geoffhodgson.com',
    user: 'chatapprw',
    password: 'S7r4wB3rr7K1w1303!',
    database: 'chatapp_geoffhodgson'
});

//connect
db.connect((err) => {
    if(err){
        throw err;
    }else{
        console.log("Database connection successful.");
    }
});

const app = express();

app.get('/getChats', (request, response) =>{
    let sql = "SELECT * FROM chats";
    db.query(sql, (err, result) => {
        if(err) throw err;
        response.set('Access-Control-Allow-Origin', 'https://www.geoffhodgson.com');
        response.send(result);
    });
});

app.get('/addChat', (request, response) => {
    let post = {text: request.query.text, sent_by: request.query.sent_by};
    let sql = "INSERT INTO chats SET ?";
    db.query(sql, post, (err, result) => {
        let sendout = {
            chat_id: result.insertId,
            text: post.text,
            sent_by: post.sent_by
        }
        response.set('Access-Control-Allow-Origin', 'https://www.geoffhodgson.com');
        response.send(sendout);
    });
});

app.listen(process.env.PORT || '3001', () => {
    console.log("Listening on port 3001...");
});

https.createServer(options, app).listen(3002);