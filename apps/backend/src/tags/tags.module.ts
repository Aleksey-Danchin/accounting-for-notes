import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsProvider } from './tags.provider';

@Module({
  controllers: [TagsController],
  providers: [TagsProvider],
  exports: [TagsProvider],
})
export class TagsModule {}
