
exports.up = function(knex) {
    return knex.schema
        .createTable('Users', tbl => {
            tbl.increments('user_id');
            tbl.string('username')
                .notNullable()
                .unique();
            tbl.string('password')
                .notNullable();
            tbl.string('department')
                .notNullable();
    })
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('Users');
};
