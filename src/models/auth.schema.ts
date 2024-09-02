import { sequelize } from '@auth/database';
import { IAuthDocument } from '@justmic007/9-jobber-shared';
import { compare, hash } from 'bcrypt';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';

const SALT_ROUND = 10;

type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttributes> = sequelize.define('auths', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profilePublicId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Date.now
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date()
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    }
  ]
});

AuthModel.addHook('beforeCreate', async (auth: Model) => {
  const hashedPassword: string = await hash(auth.dataValues.password as string, SALT_ROUND);
  auth.dataValues.password = hashedPassword;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(AuthModel.prototype as any).comparePassword = async function (password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
};

AuthModel.sync({}); // with {force: true}, it always deletes the table when there is a server restart
export { AuthModel }
