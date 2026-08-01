import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { PublicUser } from '__prisma/types/public-user';
import type { Tag } from '__prisma/generated/prisma/client';
import { ZodError } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
import { SessionUser } from '../auth/session-user.decorator';
import {
  addRequisiteTagsSchema,
  createRequisiteSchema,
  updateRequisiteSchema,
  type AddRequisiteTagsDTO,
  type CreateRequisiteDTO,
  type UpdateRequisiteDTO,
} from './dto';
import {
  NotesProvider,
  type NoteWithRequisites,
  type RequisiteWithTags,
} from './notes.provider';

function parseBody<T>(schema: { parse: (data: unknown) => T }, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.issues);
    }
    throw error;
  }
}

function requireUser(user: PublicUser | null): PublicUser {
  if (!user) {
    throw new UnauthorizedException();
  }
  return user;
}

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(@Inject(NotesProvider) private readonly notes: NotesProvider) {}

  @Get()
  listNotes(
    @SessionUser() user: PublicUser | null,
  ): Promise<NoteWithRequisites[]> {
    return this.notes.listNotes(requireUser(user).id);
  }

  @Post()
  createNote(
    @SessionUser() user: PublicUser | null,
  ): Promise<NoteWithRequisites> {
    return this.notes.createNote(requireUser(user).id);
  }

  @Get(':noteId/requisites')
  listRequisites(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
  ): Promise<RequisiteWithTags[]> {
    return this.notes.listRequisites(requireUser(user).id, noteId);
  }

  @Post(':noteId/requisites')
  createRequisite(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
    @Body() body: unknown,
  ): Promise<RequisiteWithTags> {
    const data: CreateRequisiteDTO = parseBody(createRequisiteSchema, body);
    return this.notes.createRequisite(requireUser(user).id, noteId, data);
  }

  @Get(':noteId/requisites/:requisiteId/tags')
  listRequisiteTags(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
    @Param('requisiteId') requisiteId: string,
  ): Promise<Tag[]> {
    return this.notes.listRequisiteTags(
      requireUser(user).id,
      noteId,
      requisiteId,
    );
  }

  @Post(':noteId/requisites/:requisiteId/tags')
  addRequisiteTags(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
    @Param('requisiteId') requisiteId: string,
    @Body() body: unknown,
  ): Promise<Tag[]> {
    const data: AddRequisiteTagsDTO = parseBody(addRequisiteTagsSchema, body);
    return this.notes.addRequisiteTags(
      requireUser(user).id,
      noteId,
      requisiteId,
      data,
    );
  }

  @Delete(':noteId/requisites/:requisiteId/tags/:tagId')
  removeRequisiteTag(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
    @Param('requisiteId') requisiteId: string,
    @Param('tagId') tagId: string,
  ): Promise<Tag[]> {
    return this.notes.removeRequisiteTag(
      requireUser(user).id,
      noteId,
      requisiteId,
      tagId,
    );
  }

  @Get(':noteId/requisites/:requisiteId')
  getRequisite(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
    @Param('requisiteId') requisiteId: string,
  ): Promise<RequisiteWithTags> {
    return this.notes.getRequisite(requireUser(user).id, noteId, requisiteId);
  }

  @Patch(':noteId/requisites/:requisiteId')
  updateRequisite(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
    @Param('requisiteId') requisiteId: string,
    @Body() body: unknown,
  ): Promise<RequisiteWithTags> {
    const data: UpdateRequisiteDTO = parseBody(updateRequisiteSchema, body);
    return this.notes.updateRequisite(
      requireUser(user).id,
      noteId,
      requisiteId,
      data,
    );
  }

  @Delete(':noteId/requisites/:requisiteId')
  deleteRequisite(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
    @Param('requisiteId') requisiteId: string,
  ): Promise<RequisiteWithTags> {
    return this.notes.deleteRequisite(
      requireUser(user).id,
      noteId,
      requisiteId,
    );
  }

  @Get(':noteId')
  getNote(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
  ): Promise<NoteWithRequisites> {
    return this.notes.getNote(requireUser(user).id, noteId);
  }

  @Delete(':noteId')
  deleteNote(
    @SessionUser() user: PublicUser | null,
    @Param('noteId') noteId: string,
  ): Promise<NoteWithRequisites> {
    return this.notes.deleteNote(requireUser(user).id, noteId);
  }
}
