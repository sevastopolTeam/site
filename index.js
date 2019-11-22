// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const http=require("http")
const bodyParser=require("body-parser");
const request = require('sync-request');
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

function requestToMainServer(method, path, options = {}) {
    var res = request(method, "http://localhost:1234" + path, { json: options });
    console.log(res.getBody());
    console.log(JSON.parse(res.getBody()))
    return JSON.parse(res.getBody());
}

VALIDATION_ERRORS = {
    "RegistrationPage": {
        "Name": {
            "CanNotBeEmpty": "Введите имя"
        },
        "Email": {
            "CanNotBeEmpty": "Введите email",
            "MustBeEmail": "Введите корректный email",
            "AlreadyExists": "Пользователь с таким Email уже существует"
        },
        "Phone": {
            "CanNotBeEmpty": "Введите номер телефона",
            "MustBePhone": "Введите номер телефона в формате +71234567890"
        },
        "Password": {
            "CanNotBeEmpty": "Введите пароль"
        },
        "RepeatPassword": {
            "MustBeSame": "Не совпадает с паролем"
        }
    }
}

function getValidationError(page, field, error) {
    console.log(page)
    console.log(field)
    console.log(error)
    return VALIDATION_ERRORS[page][field][error];
}

// Главная страница
app.get('/', (request, response) => {
    var res = requestToMainServer("GET", "/hi");
    console.log(res);
    response.cookie("userData", "testCookiesa");
    // response.send(JSON.stringify(res));
    response.render('home', { params: JSON.stringify(res) });
});

app.get('/registration', (request, response) => {
    console.log(request.cookies);
    response.render('registration');
});

app.post('/registration', (request, response) => {
    // console.log(request.cookies);
    var serverResponse = requestToMainServer("POST", "/api/english/registration", {
        Phone: request.body.Phone,
        Name: request.body.Name,
        Email: request.body.Email,
        Password: request.body.Password,
        RepeatPassword: request.body.RepeatPassword
    });

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    }

    console.log(serverResponse)

    if (serverResponse["Status"] == "ValidationError") {
        for (var key in serverResponse["ValidationErrors"]) {
            if (serverResponse["ValidationErrors"][key].length > 0) {
                params["ValidationErrors"][key] = getValidationError(
                    "RegistrationPage",
                    key,
                    serverResponse["ValidationErrors"][key][0]
                )
            }
        }
    }
    console.log(params["Status"]);

    response.render('registration', params);
});

console.log("Server started")
app.listen(3000)