
//========VALIDATION========
exports.isEmpty = (obj) => {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.ValidateRequiredFeilds = (request, feilds) => {
    let failed_keys = [];

    for (const feild of feilds){
        if (!(feild in request)){
            failed_keys.push(feild);
        };
    }
    
    return failed_keys;
}

//Pass Codes:
//1: 200 OK, fully validated
//2: Api key found, but permissions are too low
//3: Api key not found.

exports.ValidateApiKey = function (key, permissions, db, callback){
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
