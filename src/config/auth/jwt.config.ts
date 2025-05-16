import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    global: true,
    secret: process.env.JWT_ACCESS_TOKEN_KEY,
    // secret: process.env.JWT_ACCESS_TOKEN_KEY,
    signOptions: { expiresIn: '15s' },
  }),
);
