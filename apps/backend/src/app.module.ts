import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule, UsersModule, NotesModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
