const fs = require('fs');

const content = {
    "RU": JSON.parse(fs.readFileSync('content/ru.json', 'utf8'))
}

exports.content = content;
exports.getValidationError = function(language, page, field, error) {
    return content[language][page]["ValidationError"][field][error];
}
