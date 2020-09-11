//========ERROR CODES========

//2
exports.invalidApiKeyResponse = {
    error_code: 2,
    message: "Invalid Api key."
}

//3
exports.invalidPermissionsResponse = {
    error_code: 3,
    message: "Api account permissions are too low for this endpoint."
}

//4
// This error code is reserved for missing required request values.
exports.buildMissingRequredKeysResponse = (failed_keys) => {
    var message = '';

    if(failed_keys.length > 1)
    {
        for (key of failed_keys){
            message += `${key}, `
        }
        message += 'are required.';
    }else{
        message = `${failed_keys[0]} is required.`;
    }

    return {
        error_code: 4,
        message
    };
}