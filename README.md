# passwordless-sequelizestore
This module provides token storage for [Passwordless](https://github.com/florianheinemann/passwordless),
a node.js module for express that allows website authentication without password using verification through
email or other means. Visit the project's website https://passwordless.net for more details.

Tokens are stored in any database supported by [Sequelize](http://docs.sequelizejs.com/)
and are hashed and salted using [bcrypt](https://github.com/ncb000gt/node.bcrypt.js/.

## Usage

First, install the module:

`$ npm install passwordless-sequelizestore --save`

Afterwards, follow the guide for [Passwordless](https://github.com/florianheinemann/passwordless).
A typical implementation may look like this:

```javascript
const passwordless = require('passwordless');
const Sequelize = require('sequelize');
const { SequelizeStore, definePasswordlessTokenModel } = require('passwordless-sequelizestore');

// Initialize your Sequelize client. 
const sequelize = new Sequelize(/* ... */);
// Define the model to store the tokens and register with Sequelize. 
definePasswordlessTokenModel(sequelize, Sequelize.DataTypes);
passwordless.init(new SequelizeStore(sequelize));

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        // Send out a token
    });
    
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken());
```

Make sure you create the table and index for your database like the following, unless
you use `sequelize.sync()`.  In the case, `sync()` would create the table for you.

```sql
CREATE TABLE IF NOT EXISTS `passwordless_tokens` (
  `uid` VARCHAR(255) NOT NULL PRIMARY KEY,
  `token` VARCHAR(255) NOT NULL,
  `ttl` INTEGER NOT NULL,
  `origin_url` VARCHAR(255)
);

CREATE UNIQUE INDEX `passwordless_tokens_uid` ON `passwordless_tokens` (`uid`);
CREATE UNIQUE INDEX `passwordless_tokens_token` ON `passwordless_tokens` (`token`);
```

## Hash and salt
As the tokens are equivalent to passwords (even though they do have the security advantage of
only being valid for a limited time) they have to be protected in the same way.
passwordless-sequelizestore uses [bcrypt](https://github.com/ncb000gt/node.bcrypt.js/) with automatically
created random salts. To generate the salt 10 rounds are used.

## Tests

`$ npm test`

## License

[MIT License](http://opensource.org/licenses/MIT)

## Author
* Florian Heinemann [@thesumofall](http://twitter.com/thesumofall/)
* Sam Fung
