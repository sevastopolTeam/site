const remoteServer = require('../../../config/remote_server');

exports.index = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/sessions",
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/sessions/index', serverResponse);
    }
};