import 'tsconfig-paths/register';

import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  const http = app.getHttpAdapter().getInstance() as {
    set: (key: string, value: unknown) => void;
    use: (
      handler: (
        req: unknown,
        res: {
          setHeader: (name: string, value: string) => void;
        },
        next: () => void,
      ) => void,
    ) => void;
  };
  http.set('trust proxy', 1);
  http.use((_req, res, next) => {
    res.setHeader(
      'Accept-CH',
      [
        'Sec-CH-UA',
        'Sec-CH-UA-Mobile',
        'Sec-CH-UA-Platform',
        'Sec-CH-UA-Model',
        'Sec-CH-UA-Full-Version-List',
      ].join(', '),
    );
    next();
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
