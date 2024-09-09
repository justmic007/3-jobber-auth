import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.schema';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { firstLetterUppercase, IAuthBuyerMessageDetails, IAuthDocument } from '@justmic007/9-jobber-shared';
import { sign } from 'jsonwebtoken';
import { lowerCase, omit } from 'lodash';
import { Model, Op } from 'sequelize';

export async function createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
  console.log('!!!!!!!!!!!!!!!! data', data);

  const result: Model = await AuthModel.create(data); // Create user in the database
  const messageDetails: IAuthBuyerMessageDetails = {
    username: result.dataValues.username!,
    email: result.dataValues.email!,
    profilePicture: result.dataValues.profilePicture!,
    country: result.dataValues.country!,
    createdAt: result.dataValues.createdAt!,
    type: 'auth'
  };

  // Send message to rabbitmq
  await publishDirectMessage(
    authChannel,
    'jobber-buyer-update',
    'user-buyer',
    JSON.stringify(messageDetails),
    'Buyer details sent to buyer service.'
  );
  const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
  return userData;
}

export async function getAuthUserById(authId: number): Promise<IAuthDocument> {
  const user: Model = await AuthModel.findOne({
    where: { id: authId },
    attributes: {
      exclude: ['password']
    }
  }) as Model;
  return user.dataValues;
}

export async function getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
  const user: Model = await AuthModel.findOne({
    where: {
      [Op.or]: [
        { username: firstLetterUppercase(username) },
        { email: lowerCase(email) }
      ]
    },
    attributes: {
      exclude: ['password']
    }
  }) as Model;
  return user.dataValues;
}

export async function getUserByEmail(email: string): Promise<IAuthDocument> {
  const user: Model = await AuthModel.findOne({
    where: { email: lowerCase(email) },
    attributes: {
      exclude: ['password']
    }
  }) as Model;
  return user.dataValues;
}

export async function getUserByUsername(username: string): Promise<IAuthDocument> {
  const user: Model = await AuthModel.findOne({
    where: { username: firstLetterUppercase(username) },
    attributes: {
      exclude: ['password']
    }
  }) as Model;
  return user.dataValues;
}

export async function getAuthUserByVerificationToken(token: string): Promise<IAuthDocument> {
  const user: Model = await AuthModel.findOne({
    where: { emailVerificationToken: token },
    attributes: {
      exclude: ['password']
    }
  }) as Model;
  return user.dataValues;
}

export async function getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
  const user: Model = await AuthModel.findOne({
    where: {
      [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }]
    }
  }) as Model;
  return user.dataValues;
}

export async function updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken: string): Promise<void> {
  await AuthModel.update(
    {
      emailVerified,
      emailVerificationToken
    },
    { where: { id: authId } },
  );
}

export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
  await AuthModel.update(
    {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    },
    { where: { id: authId } },
  );
}

export async function updatePassword(authId: number, password: string): Promise<void> {
  await AuthModel.update(
    {
      password,
      passwordResetToken: '',
      passwordResetExpires: new Date()
    },
    { where: { id: authId } },
  );
}

export async function signToken(id: number, email: string, username: string): Promise<string> {
  return sign(
    {
      id,
      email,
      username
    },
    config.JWT_TOKEN!
  );
}

