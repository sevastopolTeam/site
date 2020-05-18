const remoteServer = require('../../../config/remote_server');
const helperController = require('../../../helpers/helper_controller');

function prepareParamsForIndexPage(request, serverResponse) {
    return helperController.prepareParams(request, "Admin.WordCategories.Index", {
        WordCategories: serverResponse.Body.Records,
        Pagination: helperController.getPaginationParams(
            serverResponse.Body.RecordsCount,
            request.query.page,
            helperController.PAGE_SIZE_DEFAULT
        )
    });
}

function prepareServerParamsForIndexPage(request) {
    var page = request.query.page;

    return {
        "Params": {
            "Page": page,
            "PageSize": helperController.PAGE_SIZE_DEFAULT
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

function prepareServerParamsForCreateTranslation(request) {
    result = {
        "Params": {
            "TranslationId": request.body.TranslationId,
            "WordCategoryId": request.body.WordCategoryId
        },
        "Headers": helperController.getHeaders(request)
    }

    return result;
}

exports.index = function(request, response) {
    var serverResponse = remoteServer.get("/api/english/admin/word_categories", prepareServerParamsForIndexPage(request));

    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/word_categories/index', helperController.prepareParams(request, "Admin.WordCategories.Index", {
            WordCategories: serverResponse.Body.Records,
            Pagination: helperController.getPaginationParams(
                serverResponse.Body.RecordsCount,
                request.query.page,
                helperController.PAGE_SIZE_DEFAULT
            )
        }));
    }
};

exports.view = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/word_categories/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );

    var serverResponseTranslations = remoteServer.get(
        "/api/english/admin/translation_to_categories",
        {
            "Params": {
                "WordCategoryId": request.params.id
            },
            "Headers": helperController.getHeaders(request)
        }
    );
    serverResponse["Body"]["AddTranslationLink"] = "/admin/word_categories_add_translation?word_category_id=" + request.params.id;
    console.log(serverResponseTranslations["Body"]["Records"]);
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render(
            'admin/word_categories/view',
            helperController.prepareParams(request, "Admin.WordCategories.View", {
                "WordCategory": serverResponse["Body"],
                "Translations": serverResponseTranslations["Body"]["Records"],
                "Pagination": helperController.getPaginationParams(
                    serverResponse.Body.RecordsCount,
                    request.query.page,
                    helperController.PAGE_SIZE_DEFAULT
                )
            })
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
    if (params["Status"]) {
        response.redirect("/admin/word_categories/");
    } else {
        response.render('admin/word_categories/add', params);
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
            helperController.prepareParams(request, "Admin.WordCategories.Edit", { "Form": serverResponse["Body"] })
        )
    }
};

exports.put = function(request, response) {
    var serverResponse = remoteServer.put("/api/english/admin/word_categories", prepareServerParamsForCreatePage(request));
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.WordCategories.Edit", serverResponse,);

    if (params["Status"]) {
        response.redirect("/admin/word_categories/" + request.body.Id);
    } else {
        response.render('admin/word_categories/edit', params);
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

exports.add_translation = function(request, response) {
    params = { "Form": { "WordCategoryId": request.query.word_category_id } };
    response.render(
        'admin/word_categories/add_translation',
        helperController.prepareParams(request, "Admin.WordCategories.AddTranslation", params)
    );
};

exports.create_translation = function(request, response) {
    var serverResponse = remoteServer.post(
        "/api/english/admin/translation_to_categories",
        prepareServerParamsForCreateTranslation(request)
    );
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.WordCategories.AddTranslation", serverResponse);
    console.log(params)
    if (params["Status"]) {
        response.redirect("/admin/word_categories/");
    } else {
        response.render('admin/word_categories/add_translation', params);
    }
};
