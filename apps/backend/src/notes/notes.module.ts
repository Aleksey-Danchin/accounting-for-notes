import { Module } from '@nestjs/common';
import { ActionsModule } from '../actions/actions.module';
import { NotesController } from './notes.controller';
import { NotesProvider } from './notes.provider';

@Module({
  imports: [ActionsModule],
  controllers: [NotesController],
  providers: [NotesProvider],
  exports: [NotesProvider],
})
export class NotesModule {}
