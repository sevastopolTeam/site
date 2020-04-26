const remoteServer = require('../../../config/remote_server');
const aws = require('../../../config/aws_s3');
const helperArray = require('../../../helpers/helper_array');
const helperController = require('../../../helpers/helper_controller');

const pageSize = 15;

function prepareParamsForIndexPage(request, serverResponse) {
    var countPages = Math.ceil((serverResponse.Body.WordCategoriesCount) / pageSize);
    var currentPage = request.query.page == undefined ? 0 : request.query.page;

    return helperController.prepareParams(request, "Admin.WordCategories.Index", {
        WordCategories: serverResponse.Body.WordCategories,
        Pages: helperArray.getArrayRange(0, countPages - 1),
        CurrentPage: currentPage,
        Pagination: helperController.getPaginationParams(countPages, currentPage),
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
            "Name": request.body.Name
        },
        "Headers": helperController.getHeaders(request)
    }

    if (request.body.Id != undefined) {
        result["Params"]["Id"] = request.body.Id;
    }

    return result;
}

exports.index = function(request, response) {
    var serverResponse = remoteServer.get("/api/english/admin/word_categories", prepareServerParamsForIndexPage(request));

    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render(
            'admin/word_categories/index',
            prepareParamsForIndexPage(request, serverResponse));
    }
};

exports.view = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/word_categories/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render(
            'admin/word_categories/view',
            helperController.prepareParams(request, "Admin.WordCategories.View", serverResponse["Body"])
        );
    }
};

exports.add = function(request, response) {
    response.render(
        'admin/word_categories/add',
        helperController.prepareParams(request, "Admin.WordCategories.Add")
    );
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.post("/api/english/admin/word_categories", prepareServerParamsForCreatePage(request));
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.WordCategories.Add", serverResponse);

    if (serverResponse["Status"] == "Ok") {
        response.redirect("/admin/word_categories/");
    } else {
        response.render(
            'admin/word_categories/add',
            params
        );
    }
};

exports.edit = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/word_categories/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render(
            'admin/word_categories/edit',
            helperController.prepareParams(request, "Admin.WordCategories.Edit", {
                "Request": {
                    "body": serverResponse["Body"]
                }
            })
        );
    }
};

exports.put = function(request, response) {
    var serverResponse = remoteServer.put("/api/english/admin/word_categories", prepareServerParamsForCreatePage(request));
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.WordCategories.Edit", serverResponse);

    if (params["Status"]) {
        response.redirect("/admin/word_categories/" + request.body.Id);
    } else {
        response.render(
            'admin/word_categories/edit',
            params
        );
    }
};

exports.delete = function(request, response) {
    var serverResponse = remoteServer.delete(
        "/api/english/admin/word_categories/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.redirect('/admin/word_categories?page=' + request.query.page);
    }
};
