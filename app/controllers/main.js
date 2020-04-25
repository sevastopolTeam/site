const remoteServer = require('../../config/remote_server');
const helperController = require('../../helpers/helper_controller');

exports.home = function(request, response) {
    response.render('home', helperController.prepareParams(request, "Home"));
};