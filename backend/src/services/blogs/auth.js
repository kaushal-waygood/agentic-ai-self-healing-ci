const jwt = require('jsonwebtoken');
const {
  JWT,
  MAX_LOGIN_RETRY_LIMIT,
  LOGIN_REACTIVE_TIME,
} = require('@waygood/common/constants/constant');
const User = require('@waygood/common/models/User');
const UserTokens = require('@waygood/common/models/UserTokens');
const {
  cryptoFUN,
  getDifferenceOfTwoDatesInTime,
} = require('../../utils/helper');
const dayjs = require('dayjs');

const generateAccessToken = (user) => {
  if (!JWT.ACCESS_SECRET_KEY) throw new Error('Access secret key is missing.');
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT.ACCESS_SECRET_KEY,
    {
      expiresIn: JWT.ACCESS_EXPIRES_IN,
    }
  );
};

const generateRefreshToken = (user) => {
  if (!JWT.REFRESH_SECRET_KEY)
    throw new Error('Refresh secret key is missing.');
  return jwt.sign({ id: user.id }, JWT.REFRESH_SECRET_KEY, {
    expiresIn: JWT.REFRESH_EXPIRES_IN,
  });
};

const loginService = async (username, password) => {
  try {
    let where = {
      $or: [{ email: username.toLowerCase() }, { mobileNumber: username }],
    };
    where.isActive = true;
    where.isDeleted = false;
    let user = await User.findOne(where);

    if (user) {
      if (user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT) {
        let now = dayjs();
        if (user.loginReactiveTime) {
          let limitTime = dayjs(user.loginReactiveTime);
          if (limitTime > now) {
            let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
            if (!(limitTime > expireTime)) {
              return {
                flag: true,
                data: `You can login after ${getDifferenceOfTwoDatesInTime(now, limitTime)}.`,
              };
            }
            await User.updateOne(
              { _id: user.id },
              {
                loginReactiveTime: expireTime.toISOString(),
                loginRetryLimit: user.loginRetryLimit + 1,
              }
            );
            return {
              flag: true,
              data: `You can login after ${getDifferenceOfTwoDatesInTime(now, expireTime)}.`,
            };
          } else {
            user = await User.updateOne(
              { _id: user.id },
              { loginReactiveTime: '', loginRetryLimit: 0 }
            );
          }
        } else {
          let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
          await User.updateOne(
            { _id: user.id },
            {
              loginReactiveTime: expireTime.toISOString(),
              loginRetryLimit: user.loginRetryLimit + 1,
            }
          );
          return {
            flag: true,
            data: `You can login after ${getDifferenceOfTwoDatesInTime(now, expireTime)}.`,
          };
        }
      }

      if (password) {
        const isPasswordMatched = cryptoFUN(password, 'encrypt');
        if (isPasswordMatched !== user.password) {
          await User.updateOne(
            { _id: user.id },
            { loginRetryLimit: user.loginRetryLimit + 1 }
          );
          return { flag: true, data: 'Incorrect Password' };
        }
      }

      const userData = user.toJSON();
      let accessToken = generateAccessToken(user);
      let refreshToken = generateRefreshToken(user);
      let expire = dayjs().add(JWT.REFRESH_EXPIRES_IN, 'second').toISOString();
      let accessExpire = dayjs()
        .add(JWT.ACCESS_EXPIRES_IN, 'second')
        .toISOString();
      const passUserData = {
        _id: userData._id,
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        userType: userData.userType,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
      };
      await UserTokens.create({
        userId: user._id,
        refreshToken: refreshToken,
        accessToken: accessToken,
        tokenExpiredTime: expire,
        accessExpiredTime: accessExpire,
      });

      return {
        flag: false,
        data: { ...passUserData, accessToken, refreshToken },
      };
    } else {
      return { flag: true, data: 'User does not exist' };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const refreshTokenService = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT.REFRESH_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (user) {
      let newAccessToken = generateAccessToken(user);
      return { flag: false, data: { accessToken: newAccessToken } };
    } else {
      return { flag: true, data: 'Invalid refresh token' };
    }
  } catch (error) {
    return { flag: true, data: 'Invalid refresh token' };
  }
};

module.exports = { loginService, refreshTokenService };
