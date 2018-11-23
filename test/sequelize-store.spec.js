const standardTests = require('passwordless-tokenstore-test');
const Sequelize = require('sequelize');
const SequelizeStore = require('../lib/sequelize-store');
const path = require('path');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
});
sequelize['import'](path.join(__dirname, '..', 'lib', 'passwordless-token'));

function TokenStoreFactory() {
  return new SequelizeStore(sequelize);
}

function beforeEachTest(done) {
  // Drop all tables and create again.
  return sequelize.sync({ force: true }).then(() => {
    done();
  });
}

function afterEachTest(done) {
  done();
}

// Call the test suite
standardTests(TokenStoreFactory, beforeEachTest, afterEachTest);
