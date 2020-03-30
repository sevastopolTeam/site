// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const http=require("http")
const bodyParser=require("body-parser");
const request = require('sync-request');
const fs = require('fs');
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
                Phone: request.body.Phone,
                Name: request.body.Name,
                Email: request.body.Email,
                Password: request.body.Password,
                RepeatPassword: request.body.RepeatPassword
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
                Email: request.body.Email,
                Password: request.body.Password
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

console.log("Server started")
app.listen(3000)