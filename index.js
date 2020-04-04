// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const http=require("http")
const bodyParser=require("body-parser");
const request = require('sync-request');
const fs = require('fs');
const s3 = require('./s3_config.js');

var cookieParser = require('cookie-parser')

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())

function requestToMainServer(method, path, data = {}) {
    console.log(data);
    var res = request(
        method,
        "http://localhost:1234" + path,
        { headers: data["Headers"], json: data["Params"] }
    );

    return JSON.parse(res.getBody());
}

const I18 = {
    "RU": JSON.parse(fs.readFileSync('content/ru.json', 'utf8'))
}

function getValidationError(language, page, field, error) {
    return I18[language][page]["ValidationError"][field][error];
}


function uploadToAWS(filename, filebody) {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;

    params.Key = filename;
    params.Body = filebody;

    var res = undefined;
    var isFinished = undefined;
    s3Client.upload(params, (err, data) => {
        if (err) {
            res = err;
        } {
            res = data;
        }
        isFinished = true;
    });

    // ждем выполнения асинхронной операции
    while(isFinished === undefined) {
        require('deasync').runLoopOnce();
    }
    return res["Location"];
}

// returns url in AWS
function uploadToAWSByUrl(url, name) {
    var res = request("GET", url);
    return uploadToAWS("test4.jpg", res.getBody());
}

// Главная страница
app.get('/', (request, response) => {
    response.render('home');
});

app.get('/registration', (request, response) => {
    console.log(request.cookies);
    response.render('registration');
});

app.post('/registration', (request, response) => {
    var serverResponse = requestToMainServer(
        "POST",
        "/api/english/users",
        {
            "Params": {
                "Phone": request.body.Phone,
                "Name": request.body.Name,
                "Email": request.body.Email,
                "Password": request.body.Password,
                "RepeatPassword": request.body.RepeatPassword
            }
        }
    );

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    };

    if (serverResponse["Status"] == "ValidationError") {
        for (var key in serverResponse["ValidationErrors"]) {
            if (serverResponse["ValidationErrors"][key].length > 0) {
                params["ValidationErrors"][key] = getValidationError(
                    "RU",
                    "RegistrationPage",
                    key,
                    serverResponse["ValidationErrors"][key][0]
                )
            }
        }
    }
    response.render('registration', params);
});

app.get('/login', (request, response) => {
    response.render('login');
});

app.post('/login', (request, response) => {
    var serverResponse = requestToMainServer(
        "POST",
        "/api/english/login",
        {
            "Params": {
                "Email": request.body.Email,
                "Password": request.body.Password
            }
        }
    );

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    }

    if (serverResponse["Status"] == "ValidationError") {
        for (var key in serverResponse["ValidationErrors"]) {
            if (serverResponse["ValidationErrors"][key].length > 0) {
                params["ValidationErrors"][key] = getValidationError(
                    "RU",
                    "LoginPage",
                    key,
                    serverResponse["ValidationErrors"][key][0]
                )
            }
        }
    }
    if (serverResponse["Status"] == "Ok") {
        response.cookie("SessionToken", serverResponse["Body"]["SessionToken"]);
    }
    response.render('login', params);
});

app.get('/admin/sessions', (request, response) => {
    var serverResponse = requestToMainServer(
        "GET",
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
        response.render('admin_sessions', serverResponse);
    }
});

app.get('/admin/translations', (request, response) => {
    var serverResponse = requestToMainServer(
        "GET",
        "/api/english/admin/translations",
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin_translations', serverResponse);
    }
});

app.get('/admin/add_translation', (request, response) => {
    response.render('admin_add_translation');
});

app.get('/admin/delete_translation/:id', (request, response) => {
    var serverResponse = requestToMainServer(
        "DELETE",
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    console.log(serverResponse);
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.redirect('/admin/translations');
    }
});

app.get('/admin/translations/:id', (request, response) => {
    var serverResponse = requestToMainServer(
        "GET",
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin_view_translation', serverResponse["Body"]);
    }
});

app.get('/admin/translations/:id/edit', (request, response) => {
    var serverResponse = requestToMainServer(
        "GET",
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin_edit_translation', serverResponse["Body"]);
    }
});

app.post('/admin/add_translation', (request, response) => {
    var serverResponse = requestToMainServer(
        "POST",
        "/api/english/admin/translations",
        {
            "Params": {
                "ValueFrom": request.body.ValueFrom,
                "ValueTo": request.body.ValueTo,
                "LanguageFrom": request.body.LanguageFrom,
                "LanguageTo": request.body.LanguageTo,
                "OriginUrl": request.body.OriginUrl,
                "DownloadUrl": request.body.DownloadUrl
            },
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    }

    if (serverResponse["Status"] == "ValidationError") {
        for (var key in serverResponse["ValidationErrors"]) {
            if (serverResponse["ValidationErrors"][key].length > 0) {
                params["ValidationErrors"][key] = getValidationError(
                    "RU",
                    "AddTranslationPage",
                    key,
                    serverResponse["ValidationErrors"][key][0]
                )
            }
        }
    }
    response.render('admin_add_translation', params);
});

// function uploadWord(word) {
//     var serverResponse = requestToMainServer(
//         "POST",
//         "/api/english/admin/translations",
//         {
//             "Params": {
//                 "ValueFrom": word["ValueFrom"],
//                 "ValueTo": word["ValueTo"],
//                 "LanguageFrom": "русский",
//                 "LanguageTo": "english",
//                 "OriginUrl": "",
//                 "DownloadUrl": ""
//             },
//             "Headers": {
//                 "Authorization": "00dbbc3d6fdd485fcdc1c1458aedb4c61585928683"
//             }
//         }
//     );
//     console.log(serverResponse);
// }


// words.forEach(function(item, i, arr) {
//     // console.log(item)
//     uploadWord(item)
// });


console.log("Server started")
app.listen(3000)