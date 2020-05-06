const remoteServer = require('../../../config/remote_server');
const helperController = require('../../../helpers/helper_controller');

exports.index = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/sessions", {"Headers": helperController.getHeaders(request)}
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/sessions/index', serverResponse);
    }
};
