// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const http=require("http")
const bodyParser=require("body-parser");
const request = require('sync-request');


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

function requestToMainServer(method, path) {
    var res = request(method, "http://localhost:1234" + path);
    return JSON.parse(res.getBody());
}

// Главная страница
app.get('/', (request, response) => {
    var res = requestToMainServer("GET", "/hi");
    console.log(res);
    response.render('home', { params: JSON.stringify(res) });
});

app.get('/registration', (request, response) => {
    response.render('registration', {
        "form_class": "needs-validation"
    });
});

app.post('/registration', (request, response) => {
    params = {
        form_class: "was-validated",
        name_error: request.body.name.length > 0 ? "" : "Введите имя"
    }
    console.log(params);
    response.render('registration', params);
});

console.log("Server started")
app.listen(3000)