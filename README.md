# passwordless-sequelizestore
TokenStore for Passwordless using Sequelize

```
CREATE TABLE IF NOT EXISTS `passwordless_tokens` (
  `uid` VARCHAR(255) NOT NULL PRIMARY KEY,
  `token` VARCHAR(255) NOT NULL,
  `ttl` INTEGER NOT NULL,
  `origin_url` VARCHAR(255)
);

CREATE UNIQUE INDEX `passwordless_tokens_token` ON `passwordless_tokens` (`token`);
```
