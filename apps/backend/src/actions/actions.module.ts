import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsProvider } from './actions.provider';

@Module({
  controllers: [ActionsController],
  providers: [ActionsProvider],
  exports: [ActionsProvider],
})
export class ActionsModule {}
