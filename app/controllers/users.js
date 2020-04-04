const remoteServer = require('../../config/remote_server');
const I18 = require('../../config/i18');

exports.signup = function(request, response) {
    response.render('signup');
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.request(
        "POST",
        "/api/english/users",
        {
            "Params": {
                "Phone": request.body.Phone,
                "Name": request.body.Name,
                "Email": request.body.Email,
                "Password": request.body.Password,
                "RepeatPassword": request.body.RepeatPassword
            }
        }
    );

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    };

    if (serverResponse["Status"] == "ValidationError") {
        for (var key in serverResponse["ValidationErrors"]) {
            if (serverResponse["ValidationErrors"][key].length > 0) {
                params["ValidationErrors"][key] = I18.getValidationError(
                    "RU",
                    "RegistrationPage",
                    key,
                    serverResponse["ValidationErrors"][key][0]
                )
            }
        }
    }
    response.render('signup', params);
};

exports.login = function(request, response) {
    response.render('login');
};

exports.signin = function(request, response) {
    var serverResponse = remoteServer.request(
        "POST",
        "/api/english/login",
        {
            "Params": {
                "Email": request.body.Email,
                "Password": request.body.Password
            }
        }
    );

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    }

    if (serverResponse["Status"] == "ValidationError") {
        for (var key in serverResponse["ValidationErrors"]) {
            if (serverResponse["ValidationErrors"][key].length > 0) {
                params["ValidationErrors"][key] = I18.getValidationError(
                    "RU",
                    "LoginPage",
                    key,
                    serverResponse["ValidationErrors"][key][0]
                )
            }
        }
    }
    if (serverResponse["Status"] == "Ok") {
        response.cookie("SessionToken", serverResponse["Body"]["SessionToken"]);
    }
    response.render('login', params);
};