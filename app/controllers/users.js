const remoteServer = require('../../config/remote_server');
const I18 = require('../../config/i18');
const helperController = require('../../helpers/helper_controller');

exports.signup = function(request, response) {
    response.render('users/signup');
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.post(
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

    console.log(serverResponse);

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    };

    if (serverResponse["Status"] == "ValidationError") {
        helperController.updateValidationErrors(
            params,
            serverResponse["ValidationErrors"],
            "RU",
            "Signup"
        )
    }
    response.render('users/signup', params);
};

exports.login = function(request, response) {
    response.render('users/login');
};

exports.signin = function(request, response) {
    var serverResponse = remoteServer.post(
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
        helperController.updateValidationErrors(
            params,
            serverResponse["ValidationErrors"],
            "RU",
            "Signin"
        )
    }
    if (serverResponse["Status"] == "Ok") {
        response.cookie("SessionToken", serverResponse["Body"]["SessionToken"]);
    }
    response.render('users/login', params);
};

exports.logout = function(request, response) {
	var serverResponse = remoteServer.delete(
        "/api/english/logout",
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );

	response.clearCookie("SessionToken");
	response.redirect('/');
}
