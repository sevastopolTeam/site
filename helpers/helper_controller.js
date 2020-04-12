const I18 = require('../config/i18');

exports.getHeaders = function(request) {
    return { "Authorization": request.cookies["SessionToken"] };
}

exports.updateValidationErrors = function(params, errors, language, page) {
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