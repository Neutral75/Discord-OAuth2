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
    const tokenType = request.cookies.token_type;
    const accessToken = request.cookies.access_token;
    let page = 'dashboard';

    if (!tokenType || !accessToken) {
        page = 'login'
    }

    return response.render('index', {
        page: page
    });
});

app.get('/testing', async (request, response) => {
    return response.render('testing')
});

app.get('/login', async (request, response) => {
    return response.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${config.redirectURI}&response_type=code&scope=${config.scope}`);
});

app.get('/logout', async (request, response) => {
    response.clearCookie('token_type');
    response.clearCookie('access_token');

    return response.redirect('/');
});

app.get('/auth/discord', async (request, response) => {
    const code = request.query.code;

    const result = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: config.clientID,
            client_secret: config.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectURI,
            scope: config.scope
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const data = await result.json();

    response.cookie('token_type', data.token_type);
    response.cookie('access_token', data.access_token, {
        maxAge: data.expires_in * 1000,
        httpOnly: true,
    });

    return response.redirect('/dashboard');
});

app.get('/dashboard', async (request, response) => {
    const tokenType = request.cookies.token_type;
    const accessToken = request.cookies.access_token;

    if (!tokenType || !accessToken) {
        return response.redirect('/login');
    }

    const userData = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${accessToken}`
        }
    });

    const guildsData = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            authorization: `${tokenType} ${accessToken}`
        }
    });

    const user = await userData.json();
    const guilds = await guildsData.json();

    return response.render('dashboard', {
        user: user,
        guilds: guilds
    });
});

app.listen(config.PORT, () => {
    return console.log('Beep! Running on PORT ' + config.PORT);
});