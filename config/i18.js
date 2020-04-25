const fs = require('fs');

const content = {
    "RU": JSON.parse(fs.readFileSync('content/ru.json', 'utf8'))
}

exports.content = content;

function get(path) {
    var current = content;
    path.split('.').forEach(function(p){ current = current[p]; }); 
    return current;
}

exports.getValidationError = function(language, page, field, error) {
    return content[language][page]["ValidationError"][field][error];
}

exports.get = get;
