/**
 * Sequelize model for Passwordless token.
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PasswordlessToken', {
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ttl: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referer: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'passwordless_tokens',
    timestamps: false,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['uid'],
      },
      {
        unique: true,
        fields: ['token'],
      },
    ],
  });
};
