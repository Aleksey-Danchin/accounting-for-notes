import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesProvider } from './notes.provider';

@Module({
  controllers: [NotesController],
  providers: [NotesProvider],
  exports: [NotesProvider],
})
export class NotesModule {}
