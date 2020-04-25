const I18 = require('../config/i18');

function updateValidationErrors(params, errors, language, prefix) {
    for (var key in errors) {
        if (errors[key].length > 0) {
            params["ValidationErrors"][key] = I18.get(language + "." + prefix + ".ValidationErrors." + key + "." + errors[key][0]);
        }
    }
};

function getLanguage(request) {
    var lang = request.cookies["Language"];
    if (lang != "RU" && lang != "EN") {
        lang = "RU";
    }

    return lang;
}

function prepareParams(request, prefix, params = {}) {
    params["I18"] = I18.get(getLanguage(request) + "." + prefix);
    params["I18MainLayout"] = I18.get(getLanguage(request) + ".MainLayout");
    return params;
}


exports.getHeaders = function(request) {
    return { "Authorization": request.cookies["SessionToken"] };
}

exports.prepareParamsWithValidationErrors = function(request, prefix, serverResponse) {
    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    }

    if (serverResponse["Status"] == "ValidationError") {
        updateValidationErrors(
            params,
            serverResponse["ValidationErrors"],
            getLanguage(request),
            prefix
        )
    }

    return prepareParams(request, prefix, params);
}

exports.updateValidationErrors = updateValidationErrors;
exports.prepareParams = prepareParams;

exports.getPaginationParams = function(countPages, currentPage) {
    return {
        First: 0,
        BeforePrevious: currentPage - 2 >= 0 ? currentPage - 2 : undefined,
        Previous: currentPage - 1 >= 0 ? currentPage - 1 : undefined,
        Current: currentPage,
        Next: currentPage - 0 + 1 < countPages ? currentPage - 0 + 1 : undefined,
        AfterNext: currentPage - 0 + 2 < countPages ? currentPage - 0 + 2 : undefined,
        Last: countPages - 1
    };
}