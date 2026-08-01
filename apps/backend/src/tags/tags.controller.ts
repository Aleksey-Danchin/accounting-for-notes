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
  UseGuards,
} from '@nestjs/common';
import type { Tag } from '__prisma/generated/prisma/client';
import { ZodError } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
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

@Controller('tags')
@UseGuards(AuthGuard)
export class TagsController {
  constructor(@Inject(TagsProvider) private readonly tags: TagsProvider) {}

  @Get()
  listTags(): Promise<Tag[]> {
    return this.tags.listTags();
  }

  @Post()
  createTag(@Body() body: unknown): Promise<Tag> {
    const data: CreateTagDTO = parseBody(createTagSchema, body);
    return this.tags.createTag(data);
  }

  @Get(':id')
  getTag(@Param('id') id: string): Promise<Tag> {
    return this.tags.getTag(id);
  }

  @Patch(':id')
  updateTag(@Param('id') id: string, @Body() body: unknown): Promise<Tag> {
    const data: UpdateTagDTO = parseBody(updateTagSchema, body);
    return this.tags.updateTag(id, data);
  }

  @Delete(':id')
  deleteTag(@Param('id') id: string): Promise<Tag> {
    return this.tags.deleteTag(id);
  }
}
