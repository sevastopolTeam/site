const remoteServer = require('../../../config/remote_server');
const aws = require('../../../config/aws_s3');
const helperArray = require('../../../helpers/helper_array');
const helperController = require('../../../helpers/helper_controller');
const I18 = require('../../../config/i18');

const pageSize = 15;

function prepareParamsForIndexPage(request, serverResponse) {
    return helperController.prepareParams(request, "Admin.Users.Index", {
        Users: serverResponse.Body.Records,
        Pagination: helperController.getPaginationParams(serverResponse.Body.RecordsCount, request.query.page, pageSize),
    });
}

function prepareServerParamsForIndexPage(request) {
    var page = request.query.page;

    return {
        "Params": {
            "Page": page,
            "PageSize": pageSize
        },
        "Headers": helperController.getHeaders(request)
    }
}

function prepareServerParamsForCreatePage(request) {
    result = {
        "Params": {
            "Name": request.body.Name,
            "Email": request.body.Email,
            "Phone": request.body.Phone,
            "Password": request.body.Password,
            "RepeatPassword": request.body.RepeatPassword
        },
        "Headers": helperController.getHeaders(request)
    }

    if (request.body.Id != undefined) {
        result["Params"]["Id"] = request.body.Id;
    }

    return result;
}

exports.index = function(request, response) {
    var serverResponse = remoteServer.get("/api/english/admin/users", prepareServerParamsForIndexPage(request));

    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/users/index', prepareParamsForIndexPage(request, serverResponse));
    }
};

exports.view = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/users/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render(
            'admin/users/view',
            helperController.prepareParams(request, "Admin.Users.View", serverResponse["Body"])
        );
    }
};

exports.delete = function(request, response) {
    var serverResponse = remoteServer.delete(
        "/api/english/admin/users/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.redirect('/admin/users?page=' + request.query.page);
    }
};


exports.add = function(request, response) {
    response.render(
        'admin/users/add',
        helperController.prepareParams(request, "Admin.Users.Add")
    );
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.post("/api/english/admin/users", prepareServerParamsForCreatePage(request));
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.Users.Add", serverResponse);
    if (params["Status"]) {
        response.redirect("/admin/users/");
    } else {
        response.render('admin/users/add', params);
    }
};

exports.edit = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/users/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render(
            'admin/users/edit',
            helperController.prepareParams(request, "Admin.Users.Edit", {
                "Request": {
                    "body": serverResponse["Body"]
                }
            })
        )
    }
};

exports.put = function(request, response) {
    var serverResponse = remoteServer.put("/api/english/admin/users", prepareServerParamsForCreatePage(request));
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.Users.Edit", serverResponse);

    if (params["Status"]) {
        response.redirect("/admin/users/" + request.body.Id);
    } else {
        response.render('admin/users/edit', params);
    }
};
