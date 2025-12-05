import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  return token;
};
