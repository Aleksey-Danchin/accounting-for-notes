import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Tag } from '__prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTagDTO, UpdateTagDTO } from './dto';

@Injectable()
export class TagsProvider {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  createTag(data: CreateTagDTO): Promise<Tag> {
    return this.prisma.tag.create({ data });
  }

  async updateTag(id: string, data: UpdateTagDTO): Promise<Tag> {
    await this.getTag(id);
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  async deleteTag(id: string): Promise<Tag> {
    await this.getTag(id);
    return this.prisma.tag.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
