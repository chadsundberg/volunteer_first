var pg = require('pg');

var config = {
  database: 'phi',
  host: 'localhost',
  port: 5432,
  max: 10000,
  idleTimeMillis: 1000
};

module.exports = new pg.Pool(config);
