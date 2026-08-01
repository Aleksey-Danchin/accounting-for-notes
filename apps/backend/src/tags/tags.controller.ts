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
import type { Tag } from '__prisma/generated/prisma/client';
import type { PublicUser } from '__prisma/types/public-user';
import { ZodError } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
import { SessionUser } from '../auth/session-user.decorator';
import {
  createTagSchema,
  updateTagSchema,
  type CreateTagDTO,
  type UpdateTagDTO,
} from './dto';
import { TagsProvider } from './tags.provider';

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

@Controller('tags')
@UseGuards(AuthGuard)
export class TagsController {
  constructor(@Inject(TagsProvider) private readonly tags: TagsProvider) {}

  @Get()
  listTags(): Promise<Tag[]> {
    return this.tags.listTags();
  }

  @Post()
  createTag(
    @SessionUser() user: PublicUser | null,
    @Body() body: unknown,
  ): Promise<Tag> {
    const data: CreateTagDTO = parseBody(createTagSchema, body);
    return this.tags.createTag(requireUser(user).id, data);
  }

  @Get(':id')
  getTag(@Param('id') id: string): Promise<Tag> {
    return this.tags.getTag(id);
  }

  @Patch(':id')
  updateTag(
    @SessionUser() user: PublicUser | null,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<Tag> {
    const data: UpdateTagDTO = parseBody(updateTagSchema, body);
    return this.tags.updateTag(requireUser(user).id, id, data);
  }

  @Delete(':id')
  deleteTag(
    @SessionUser() user: PublicUser | null,
    @Param('id') id: string,
  ): Promise<Tag> {
    return this.tags.deleteTag(requireUser(user).id, id);
  }
}
