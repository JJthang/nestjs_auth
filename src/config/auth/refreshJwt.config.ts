import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    secret:
      '988cfa0f54042bdc06824ccd973c949627d46145fe280fd7152c33fd94c0eeb7a7315f2e0051227227c19f3cf36e70c045330c3b83a781f3276c77a193890366',
    // secret: process.env.JWT_REFRESH_TOKEN_KEY,
    expiresIn: '1d',
  }),
);
