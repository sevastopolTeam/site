const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const http = require("http")
const bodyParser = require("body-parser");

const env = require('./env');

const sessions = require('./app/controllers/admin/sessions');
const translations = require('./app/controllers/admin/translations');
const word_categories = require('./app/controllers/admin/word_categories');
const users = require('./app/controllers/users');
const adminUsers = require('./app/controllers/admin/users');
const main = require('./app/controllers/main');

const aws = require('./config/aws_s3');

var cookieParser = require('cookie-parser')

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'app/views/layouts'),
    partialsDir: path.join(__dirname, 'app/views/partials'),
    helpers: {
        isEqual: function(a, b, opts) {
            if (a == b) {
                return opts.fn(this) 
            } else { 
                return opts.inverse(this) 
            }
        },
        isNotEqual: function(a, b, opts) {
            if (a != b) {
                return opts.fn(this) 
            } else { 
                return opts.inverse(this) 
            }
        }
    }
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'app/views'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', main.home);

app.get('/signup', users.signup);
app.post('/signup', users.create);
app.get('/login', users.login);
app.post('/login', users.signin);
app.get('/logout', users.logout);
app.get('/change_language', users.changeLanguage);

app.get('/admin/sessions', sessions.index);

app.get('/admin/translations', translations.index);
app.get('/admin/translation_delete/:id', translations.delete);
app.get('/admin/translations/:id', translations.view);
app.get('/admin/translations/:id/edit', translations.edit);
app.post('/admin/translations/:id/edit', translations.put);
app.get('/admin/translation_add', translations.add);
app.post('/admin/translation_add', translations.create);

app.get('/admin/word_categories', word_categories.index);
app.get('/admin/word_category_delete/:id', word_categories.delete);
app.get('/admin/word_categories/:id', word_categories.view);
app.get('/admin/word_categories/:id/edit', word_categories.edit);
app.post('/admin/word_categories/:id/edit', word_categories.put);
app.get('/admin/word_category_add', word_categories.add);
app.post('/admin/word_category_add', word_categories.create);

app.get('/admin/users', adminUsers.index);
app.get('/admin/user_delete/:id', adminUsers.delete);
app.get('/admin/users/:id', adminUsers.view);
app.get('/admin/users/:id/edit', adminUsers.edit);
app.post('/admin/users/:id/edit', adminUsers.put);
app.get('/admin/user_add', adminUsers.add);
app.post('/admin/user_add', adminUsers.create);

console.log("Server started")
app.listen(env.PORT)