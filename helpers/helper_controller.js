const I18 = require('../config/i18');

function updateValidationErrors(params, errors, language, page) {
    for (var key in errors) {
        if (errors[key].length > 0) {
            params["ValidationErrors"][key] = I18.getValidationError(
                language,
                page,
                key,
                errors[key][0]
            )
        }
    }
};

exports.getHeaders = function(request) {
    return { "Authorization": request.cookies["SessionToken"] };
}

exports.updateValidationErrors = updateValidationErrors;

exports.preparePostParams = function(serverResponse, request, language, page) {
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
            language,
            page
        )
    }

    return params;
}

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