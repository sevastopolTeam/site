// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const http = require("http")
const bodyParser = require("body-parser");

const translations = require('./app/controllers/translations');
const users = require('./app/controllers/users');
const sessions = require('./app/controllers/sessions');

const aws = require('./config/aws_s3');

var cookieParser = require('cookie-parser')

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'app/views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'app/views'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())

app.get('/', (request, response) => {
    response.render('home');
});

app.get('/signup', users.signup);
app.post('/signup', users.create);
app.get('/login', users.login);
app.post('/login', users.signin);

app.get('/admin/sessions', sessions.index);

app.get('/admin/translations', translations.index);
app.get('/admin/translation-delete/:id', translations.delete);
app.get('/admin/translations/:id', translations.view);
app.get('/admin/translations/:id/edit', translations.edit);
app.get('/admin/translations-add', translations.add);
app.post('/admin/translation-add', translations.create);

console.log("Server started")
app.listen(3000)