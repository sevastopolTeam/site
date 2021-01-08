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
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render(
            'admin/word_categories/view',
            helperController.prepareParams(request, "Admin.WordCategories.View", {
                "WordCategory": serverResponse["Body"],
                "AddTranslationLink": "/admin/word_categories_add_translation?WordCategoryId=" + request.params.id,
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
    var serverResponse = remoteServer.get(
        "/api/english/admin/word_categories/" + request.query.WordCategoryId,
        { "Headers": helperController.getHeaders(request) }
    );

    params = { "Form": { "WordCategoryId": request.query.WordCategoryId }, "WordCategoryName": serverResponse["Body"]["Name"] };
    response.render(
        'admin/word_categories/add_translation',
        helperController.prepareParams(request, "Admin.WordCategories.AddTranslation", params)
    );
};

exports.create_translation = function(request, response) {
    arr = request.body.TranslationId.split(' - ');
    var serverResponse = remoteServer.get(
        "/api/english/admin/translation_by_full_matching",
        {
            "Params": {
                "Russian": arr[0],
                "English": arr[1]
            },
            "Headers": helperController.getHeaders(request)
        }
    );
    translationId = ""
    if (serverResponse["Status"] == "Ok") {
        translationId = serverResponse["Body"]["Id"];
    }

    var serverResponse = remoteServer.post(
        "/api/english/admin/translation_to_categories", {
            "Params": {
                "TranslationId": translationId,
                "WordCategoryId": request.body.WordCategoryId
            },
            "Headers": helperController.getHeaders(request)
        }
    );
    var wordCategoryResponse = remoteServer.get(
        "/api/english/admin/word_categories/" + request.query.WordCategoryId,
        { "Headers": helperController.getHeaders(request) }
    );
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.WordCategories.AddTranslation", serverResponse);
    console.log(params)
    params["WordCategoryName"] = wordCategoryResponse["Body"]["Name"]
    if (params["Status"]) {
        response.redirect("/admin/word_categories/");
    } else {
        response.render('admin/word_categories/add_translation', params);
    }
};
