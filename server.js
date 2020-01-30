const express = require('express');
const db = require('./userDB');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const jwt = require('jsonwebtoken');


const server = express();

const sessionConfig = {
    name: 'LambdaSchoolSessionAPI', // defaults to sid if not declared
    secret: 'We got a huge secret to keep safe',
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false, // true in production
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: false, // GDPR laws against saving cooking automatically 
};

const Secrets = {
    jwtSecret: process.env.JWT_SECRET || 'adsn;savsd#@asldkfj'
}

server.use(express.json());
server.use(session(sessionConfig));

server.post('/api/register', (req, res) => {
    let user = req.body;

    const hash = bcrypt.hashSync(user.password, 12);
    user.password = hash;

    db.addUser(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

server.post('/api/login', (req, res) => {
    let {username, password} = req.body;

    db.getUser(username)
        .then(user => {
            if(user && bcrypt.compareSync(password, user.password)) {

                const token = generateToken(user);

                req.session.user = user;
                res.status(200).json({ 
                    message: `Welcome ${user.username}`,
                    token
                });
            } else {
                res.status(401).json({ message: 'You shall not pass!'});
            }
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

server.get('/api/logout', (req, res) => {
    if(req.session) {
        req.session.destroy(err => {
            if(err) {
                res.json({ message: 'logout error' });
            } else {
                res.status(200).json({ message: 'bye bye' });
            }
        })
    }
});

server.get('/api/users', restricted, (req, res) => {
    db.getUsers()
        .then(users => res.send(users));
});

function restricted(req, res, next) {
    if(req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'You shall not pass!'});
    }
}

function generateToken(user) {
    const payload = {
        subject: user.user_id, // sub
        username: user.username,
        // ...other data
    }

    const secret = Secrets.jwtSecret;

    const options = {
        expiresIn: '8h',
    };
    return jwt.sign(payload, secret, options);
}

module.exports = server;