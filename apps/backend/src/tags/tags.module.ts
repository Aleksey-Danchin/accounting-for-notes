import { Module } from '@nestjs/common';
import { ActionsModule } from '../actions/actions.module';
import { TagsController } from './tags.controller';
import { TagsProvider } from './tags.provider';

@Module({
  imports: [ActionsModule],
  controllers: [TagsController],
  providers: [TagsProvider],
  exports: [TagsProvider],
})
export class TagsModule {}
