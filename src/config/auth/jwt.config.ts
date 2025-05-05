import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwtAccessToken',
  (): JwtModuleOptions => ({
    global: true,
    secret:
      '989707851bfcbcef43355da0c259af6daa284706e22953bbe76dcc4d3f580ce3caddb0c704221f3390590173ef186ddbea2398ac626dce7f08001584bd9f7996',
    // secret: process.env.JWT_ACCESS_TOKEN_KEY,
    // 989707851bfcbcef43355da0c259af6daa284706e22953bbe76dcc4d3f580ce3caddb0c704221f3390590173ef186ddbea2398ac626dce7f08001584bd9f7996
    signOptions: { expiresIn: '60s' },
  }),
);
