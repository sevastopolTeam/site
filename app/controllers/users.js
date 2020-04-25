const remoteServer = require('../../config/remote_server');
const helperController = require('../../helpers/helper_controller');

function prepareServerParamsForSignupPage(request) {
    return {
        "Params": {
            "Phone": request.body.Phone,
            "Name": request.body.Name,
            "Email": request.body.Email,
            "Password": request.body.Password,
            "RepeatPassword": request.body.RepeatPassword
        }
    }
}

function prepareServerParamsForSigninPage(request) {
    return {
        "Params": {
            "Email": request.body.Email,
            "Password": request.body.Password
        }
    };
}

exports.signup = function(request, response) {
    response.render('users/signup', helperController.prepareParams(request, "Users.Signup"));
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.post(
        "/api/english/users",
        prepareServerParamsForSignupPage(request)
    );

    if (serverResponse["Status"] == "Ok") {
        response.redirect('/users/login');
    } else {
        response.render('users/signup', helperController.prepareParamsWithValidationErrors(request, "Users.Signup", serverResponse));
    }
};

exports.login = function(request, response) {
    response.render('users/login', helperController.prepareParams(request, "Users.Signin"));
};

exports.signin = function(request, response) {
    var serverResponse = remoteServer.post(
        "/api/english/login",
        prepareServerParamsForSigninPage(request)
    );
    if (serverResponse["Status"] == "Ok") {
        response.cookie("SessionToken", serverResponse["Body"]["SessionToken"]);
        response.redirect('/');
    } else {
        response.render('users/login', helperController.prepareParamsWithValidationErrors(request, "Users.Signin", serverResponse));
    }
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

exports.changeLanguage = function(request, response) {
    var lang = request.query.language;
    if (lang == "RU" || lang == "EN") {
        response.cookie("Language", lang);
    }
    response.redirect('/');
}
