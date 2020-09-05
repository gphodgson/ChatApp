require('dotenv').config()
const express =  require('express');
const app = express();
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require("body-parser");
const uuid = require('uuid');
//========Constants========

const __dev__= process.env.DEV;

//========SSL========

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

//========Database Connection========

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

//========SOCKETS========

//https socket
const io = require('socket.io')(https)
//http socket
const ioHttp = require('socket.io')(http)

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

//========VALIDATION========

const isEmpty = (obj) => {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//Pass Codes:
//1: 200 OK, fully validated
//2: Api key found, but permissions are too low
//3: Api key not found.

const ValidateRequiredFeilds = (request, feilds) => {
    failed_keys = [];

    for (feild of feilds){
        if (!(feild in request)){
            failed_keys.push(feild);
        };
    }

    return failed_keys;
}

const ValidateApiKey = (key, permissions, callback) => {
    let sql = `SELECT * FROM api_users WHERE api_key='${key}' LIMIT 1`;

    db.query(sql, (err, result) => {
        if(err) throw err;

        let pass = 3;
        if(result.length !== 0){
            pass = 2
            if(result[0].permissions >= permissions ) pass = 1;
        };

        callback(pass);
    });
}


//========ERROR CODES========

//2
const invalidApiKeyResponse = {
    error_code: 2,
    message: "Invalid Api key."
}

//3
const invalidPermissionsResponse = {
    error_code: 3,
    message: "Api account permissions are too low for this endpoint."
}

//4
// This error code is reserved for missing required request values.
const buildMissingRequredKeysResponse = (failed_keys) => {
    var message = '';

    if(failed_keys.length > 1)
    {
        for (key of failed_keys){
            message += `${key},`
        }
        message += ' are required.';
    }else{
        message = `${failed_keys[0]} is required.`;
    }

    return {
        error_code: 4,
        message
    };
}

//========REQUESTS========

app.use(bodyParser.json({ extended: true }));

app.post('/createUser', (request, response) => {
    response.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL);
    const requiredFeilds = [
        "api_key",
        "username",
        "permissions"
    ];

    failed_keys = ValidateRequiredFeilds(request.body, requiredFeilds);

    if(failed_keys.length === 0){
        ValidateApiKey(request.body.api_key, 7, (pass) => {
            if(pass == 1)
            {
                let newUser = {username: request.body.username, user_description: request.body.description || '', permissions: request.body.permissions, api_key: uuid.v4()};
                let sql = "INSERT INTO api_users SET ?";
                db.query(sql, newUser, (err, result) => {
                    if(err) throw err;

                    if(__dev__) console.log(`Added new user:\n${newUser}, ID: ${result.insertId}`);

                    response.send(newUser);
                });
            }else if (pass == 2){
                response.send(invalidPermissionsResponse);
            }else{
                response.send(invalidApiKeyResponse);
            }
        });
    }else{
        response.send(buildMissingRequredKeysResponse(failed_keys));
    }
});

app.get('/chatapp/getChats', (request, response) =>{
    response.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL);
    const requiredFeilds = [
        "api_key",
    ];

    failed_keys = ValidateRequiredFeilds(request.query, requiredFeilds);

    if(failed_keys.length === 0)
    {
        ValidateApiKey(request.query.api_key, 3, (pass) => {
            if(pass === 1){
                let sql = "SELECT * FROM chats";
                db.query(sql, (err, result) => {
                    if(err) throw err;
                    response.send(result);
                });
            }else if (pass === 2){
                response.send(invalidPermissionsResponse);
            }else{
                response.send(invalidApiKeyResponse);
            }
        });
    }else{
        response.send(buildMissingRequredKeysResponse(failed_keys));
    }

});

app.get('/chatapp/addChat', (request, response) => {
    response.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL);

    const requiredFeilds = [
        "api_key",
        "text",
        "sent_by"
    ];
    failed_keys = ValidateRequiredFeilds(request.query, requiredFeilds);

    if(failed_keys.length === 0)
    {
        ValidateApiKey(request.query.api_key, 5, (pass) => {
            if(pass === 1){
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

                    response.send(sendout);
                });
            }else if (pass === 2){
                response.send(invalidPermissionsResponse);
            }else{
                response.send(invalidApiKeyResponse);
            }
        });
    }else{
        response.send(buildMissingRequredKeysResponse(failed_keys));
    }
});

app.use(bodyParser.urlencoded({ extended: true }));

http.listen('3001');

if(!__dev__)
{
   https.listen(process.env.PORT || '443');
}
