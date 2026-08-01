import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Tag } from '__prisma/generated/prisma/client';
import { ActionsProvider } from '../actions/actions.provider';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTagDTO, UpdateTagDTO } from './dto';

@Injectable()
export class TagsProvider {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ActionsProvider) private readonly actions: ActionsProvider,
  ) {}

  listTags(): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async getTag(id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findFirst({
      where: { id, deletedAt: null },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async createTag(userId: string, data: CreateTagDTO): Promise<Tag> {
    const tag = await this.prisma.tag.create({ data });
    await this.actions.record({
      type: 'create_tag',
      userId,
      tagId: tag.id,
      payload: { name: tag.name },
    });
    return tag;
  }

  async updateTag(
    userId: string,
    id: string,
    data: UpdateTagDTO,
  ): Promise<Tag> {
    await this.getTag(id);
    const tag = await this.prisma.tag.update({
      where: { id },
      data,
    });
    await this.actions.record({
      type: 'update_tag',
      userId,
      tagId: tag.id,
      payload: { name: tag.name },
    });
    return tag;
  }

  async deleteTag(userId: string, id: string): Promise<Tag> {
    const existing = await this.getTag(id);
    const tag = await this.prisma.tag.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.actions.record({
      type: 'delete_tag',
      userId,
      tagId: tag.id,
      payload: { name: existing.name },
    });
    return tag;
  }
}
