import { MailerOptions } from '@nestjs-modules/mailer';

export const mailerConfig: MailerOptions = {
  // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
  // or
  transport: {
    host: 'smtp.gmail.com',
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  },
  // process.env.MAIL_USER
  // process.env.MAIL_PASS
  defaults: {
    from: '"Email confirmation code" <noreply@example.com>',
  },
  // template: {
  //   dir: join(__dirname, 'templates'),
  //   adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
  //   options: {
  //     strict: true,
  //   },
  // },
};
