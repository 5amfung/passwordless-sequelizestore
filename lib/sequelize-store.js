/**
 * Sequelize-specific implementation for Passwordless TokenStore.
 */

const util = require('util');
const bcrypt = require('bcrypt');
const TokenStore = require('passwordless-tokenstore');

function SequelizeStore(sequelize) {
  this.saltRounds = 10;
  this.sequelize = sequelize;
  if (!sequelize || !sequelize.models || !sequelize.models.PasswordlessToken) {
    throw new Error('Missing PasswordlessToken model.  You must define the model.');
  }
}

util.inherits(SequelizeStore, TokenStore);

/**
 * Checks if the provided token / user id combination exists and is
 * valid in terms of time-to-live. If yes, the method provides the
 * the stored referrer URL if any.
 * @param  {String}   token to be authenticated
 * @param  {String}   uid Unique identifier of an user
 * @param  {Function} callback in the format (error, valid, referrer).
 * In case of error, error will provide details, valid will be false and
 * referrer will be null. If the token / uid combination was not found
 * found, valid will be false and all else null. Otherwise, valid will
 * be true, referrer will (if provided when the token was stored) the
 * original URL requested and error will be null.
 */
SequelizeStore.prototype.authenticate = function(token, uid, callback) {
  if (!token || !uid || !callback) {
    throw new Error('TokenStore:authenticate called with invalid parameters');
  }
  const self = this;
  const Op = self.sequelize.Op;
  return self.sequelize.models.PasswordlessToken.findOne({
    where: {
      uid,
      ttl: {
        [Op.gte]: new Date(),
      }
    }
  }).then(result => {
    if (result && bcrypt.compareSync(token, result.token)) {
      return callback(null, true, result.referer || '');
    }
    callback(null, false, null);
  });
};

/**
 * Stores a new token / user ID combination or updates the token of an
 * existing user ID if that ID already exists. Hence, a user can only
 * have one valid token at a time
 * @param  {String}   token Token that allows authentication of _uid_
 * @param  {String}   uid Unique identifier of an user
 * @param  {Number}   msToLive Validity of the token in ms
 * @param  {String}   originUrl Originally requested URL or null
 * @param  {Function} callback Called with callback(error) in case of an
 * error or as callback() if the token was successully stored / updated
 */
SequelizeStore.prototype.storeOrUpdate = function(token, uid, msToLive, originUrl, callback) {
  if (!token || !uid || !msToLive || !callback) {
    throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
  }
  const self = this;
  bcrypt.hash(token, self.saltRounds, (error, hash) => {
    if (error) {
      return callback(error);
    }
    return self.sequelize.models.PasswordlessToken.upsert({
      uid,
      token: hash,
      ttl: new Date(Date.now() + msToLive),
      referer: originUrl
    }, {
      fields: ['uid', 'token', 'ttl', 'referer'],
    }).then(() => {
      callback();
    });
  });
};

/**
 * Invalidates and removes a user and the linked token
 * @param  {String}   uid User ID for which the record shall be removed
 * @param  {Function} callback called with callback(error) in case of an
 * error or as callback() if the uid was successfully invalidated
 */
SequelizeStore.prototype.invalidateUser = function(uid, callback) {
  if (!uid || !callback) {
    throw new Error('TokenStore:invalidateUser called with invalid parameters');
  }
  return this.sequelize.models.PasswordlessToken.destroy({ where: { uid } }).then(() => {
    callback();
  });
};

/**
 * Removes and invalidates all token
 * @param  {Function} callback Called with callback(error) in case of an
 * error or as callback() otherwise
 */
SequelizeStore.prototype.clear = function(callback) {
  if (!callback) {
    throw new Error('TokenStore:clear called with invalid parameters');
  }
  return this.sequelize.models.PasswordlessToken.destroy({ truncate: true }).then(() => {
    callback();
  });
};

/**
 * Number of tokens stored (no matter the validity)
 * @param  {Function} callback Called with callback(null, count) in case
 * of success or with callback(error) in case of an error
 */
SequelizeStore.prototype.length = function(callback) {
  return this.sequelize.models.PasswordlessToken.count().then(count => {
    callback(null, count);
  });
};

module.exports = SequelizeStore;
