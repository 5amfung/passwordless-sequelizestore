const standardTests = require('passwordless-tokenstore-test');
const Sequelize = require('sequelize');
const { definePasswordlessTokenModel, SequelizeStore } = require('../index');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
});
definePasswordlessTokenModel(sequelize, Sequelize.DataTypes);

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
