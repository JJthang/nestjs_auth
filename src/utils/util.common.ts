import * as bcrypt from 'bcrypt';

const timeOfExistence = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
};

const randomToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

const validateEmail =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export { randomToken, hashPassword, timeOfExistence, validateEmail };
