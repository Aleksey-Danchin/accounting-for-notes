import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '__prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AddRequisiteTagsDTO,
  CreateRequisiteDTO,
  UpdateRequisiteDTO,
} from './dto';

const noteRequisiteInclude = {
  requisite: {
    include: {
      tags: {
        where: { deletedAt: null },
        include: {
          tag: true,
        },
      },
    },
  },
} satisfies Prisma.NoteRequisiteInclude;

const noteInclude = {
  requisites: {
    where: { deletedAt: null, requisite: { deletedAt: null } },
    include: noteRequisiteInclude,
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.NoteInclude;

export type NoteWithRequisites = Prisma.NoteGetPayload<{
  include: typeof noteInclude;
}>;

export type RequisiteWithTags = Prisma.RequisiteGetPayload<{
  include: {
    tags: {
      include: { tag: true };
    };
  };
}>;

const requisiteWithTagsInclude = {
  tags: {
    where: { deletedAt: null },
    include: { tag: true },
  },
} satisfies Prisma.RequisiteInclude;

function toNullableJson(
  payload: CreateRequisiteDTO['payload'] | UpdateRequisiteDTO['payload'],
): Prisma.RequisiteCreateInput['payload'] | undefined {
  if (payload === undefined) {
    return undefined;
  }
  if (payload === null) {
    return Prisma.DbNull;
  }
  return payload;
}

@Injectable()
export class NotesProvider {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  listNotes(userId: string): Promise<NoteWithRequisites[]> {
    return this.prisma.note.findMany({
      where: { userId, deletedAt: null },
      include: noteInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getNote(userId: string, noteId: string): Promise<NoteWithRequisites> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
      include: noteInclude,
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  createNote(userId: string): Promise<NoteWithRequisites> {
    return this.prisma.note.create({
      data: { userId },
      include: noteInclude,
    });
  }

  async deleteNote(userId: string, noteId: string): Promise<NoteWithRequisites> {
    await this.getNote(userId, noteId);
    return this.prisma.note.update({
      where: { id: noteId },
      data: { deletedAt: new Date() },
      include: noteInclude,
    });
  }

  async listRequisites(
    userId: string,
    noteId: string,
  ): Promise<RequisiteWithTags[]> {
    await this.getNote(userId, noteId);
    const links = await this.prisma.noteRequisite.findMany({
      where: {
        noteId,
        deletedAt: null,
        requisite: { deletedAt: null },
      },
      include: noteRequisiteInclude,
      orderBy: { createdAt: 'asc' },
    });
    return links.map((link) => link.requisite);
  }

  async getRequisite(
    userId: string,
    noteId: string,
    requisiteId: string,
  ): Promise<RequisiteWithTags> {
    await this.getNote(userId, noteId);
    const link = await this.prisma.noteRequisite.findFirst({
      where: {
        noteId,
        requisiteId,
        deletedAt: null,
        requisite: { deletedAt: null },
      },
      include: noteRequisiteInclude,
    });
    if (!link) {
      throw new NotFoundException('Requisite not found');
    }
    return link.requisite;
  }

  async createRequisite(
    userId: string,
    noteId: string,
    data: CreateRequisiteDTO,
  ): Promise<RequisiteWithTags> {
    await this.getNote(userId, noteId);
    return this.prisma.$transaction(async (tx) => {
      const payload = toNullableJson(data.payload);
      const createData: Prisma.RequisiteCreateInput = {
        name: data.name,
        type: data.type,
        public: data.public,
        ...(payload !== undefined ? { payload } : {}),
      };
      const requisite = await tx.requisite.create({ data: createData });
      await tx.noteRequisite.create({
        data: { noteId, requisiteId: requisite.id },
      });
      return tx.requisite.findUniqueOrThrow({
        where: { id: requisite.id },
        include: requisiteWithTagsInclude,
      });
    });
  }

  async updateRequisite(
    userId: string,
    noteId: string,
    requisiteId: string,
    data: UpdateRequisiteDTO,
  ): Promise<RequisiteWithTags> {
    await this.getRequisite(userId, noteId, requisiteId);
    const payload = toNullableJson(data.payload);
    const updateData: Prisma.RequisiteUpdateInput = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.public !== undefined ? { public: data.public } : {}),
      ...(payload !== undefined ? { payload } : {}),
    };
    return this.prisma.requisite.update({
      where: { id: requisiteId },
      data: updateData,
      include: requisiteWithTagsInclude,
    });
  }

  async deleteRequisite(
    userId: string,
    noteId: string,
    requisiteId: string,
  ): Promise<RequisiteWithTags> {
    const requisite = await this.getRequisite(userId, noteId, requisiteId);
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.noteRequisite.update({
        where: {
          noteId_requisiteId: { noteId, requisiteId },
        },
        data: { deletedAt: now },
      }),
      this.prisma.requisite.update({
        where: { id: requisiteId },
        data: { deletedAt: now },
      }),
    ]);
    return { ...requisite, deletedAt: now };
  }

  async listRequisiteTags(
    userId: string,
    noteId: string,
    requisiteId: string,
  ) {
    const requisite = await this.getRequisite(userId, noteId, requisiteId);
    if (requisite.type !== 'tags') {
      throw new BadRequestException('Requisite is not of type tags');
    }
    return requisite.tags
      .filter((link) => link.tag.deletedAt === null)
      .map((link) => link.tag);
  }

  async addRequisiteTags(
    userId: string,
    noteId: string,
    requisiteId: string,
    data: AddRequisiteTagsDTO,
  ) {
    const requisite = await this.getRequisite(userId, noteId, requisiteId);
    if (requisite.type !== 'tags') {
      throw new BadRequestException('Requisite is not of type tags');
    }

    const tags = await this.prisma.tag.findMany({
      where: { id: { in: data.tagIds }, deletedAt: null },
    });
    if (tags.length !== data.tagIds.length) {
      throw new BadRequestException('One or more tags not found');
    }

    await this.prisma.$transaction(
      data.tagIds.map((tagId) =>
        this.prisma.requisiteTag.upsert({
          where: {
            requisiteId_tagId: { requisiteId, tagId },
          },
          create: { requisiteId, tagId },
          update: { deletedAt: null },
        }),
      ),
    );

    return this.listRequisiteTags(userId, noteId, requisiteId);
  }

  async removeRequisiteTag(
    userId: string,
    noteId: string,
    requisiteId: string,
    tagId: string,
  ) {
    const requisite = await this.getRequisite(userId, noteId, requisiteId);
    if (requisite.type !== 'tags') {
      throw new BadRequestException('Requisite is not of type tags');
    }

    const link = await this.prisma.requisiteTag.findFirst({
      where: { requisiteId, tagId, deletedAt: null },
    });
    if (!link) {
      throw new NotFoundException('Tag link not found');
    }

    await this.prisma.requisiteTag.update({
      where: {
        requisiteId_tagId: { requisiteId, tagId },
      },
      data: { deletedAt: new Date() },
    });

    return this.listRequisiteTags(userId, noteId, requisiteId);
  }
}
