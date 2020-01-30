const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig.development);

module.exports = {
    getUsers,
    getUser,
    addUser
}

function getUsers() {
    return db('Users');
}

function getUser(username) {
    return db('Users')
        .where('username', username) 
        .first();
}

function addUser(user) {
    return db('Users')
        .insert(user);
}