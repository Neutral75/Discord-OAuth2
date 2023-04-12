const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv').config();

const app = express();
const config = process.env;

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './Views')));

app.set('views', path.join(__dirname, './Views'));
app.set('view engine', 'ejs');

app.get('/', async (request, response) => {
    return response.render('index');
});

app.listen(config.PORT, () => {
    return console.log('Beep! Running on http://localhost:' + config.PORT);
});