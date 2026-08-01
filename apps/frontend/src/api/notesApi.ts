import type { NotesController } from '__backend/src/notes/notes.controller';
import type {
  AddRequisiteTagsDTO,
  CreateRequisiteDTO,
  UpdateRequisiteDTO,
} from '__backend/src/notes/dto';
import { apiClient } from '__frontend/services/api';

export async function fetchNotes(): Promise<
  Awaited<ReturnType<NotesController['listNotes']>>
> {
  const { data } =
    await apiClient.get<Awaited<ReturnType<NotesController['listNotes']>>>(
      '/notes',
    );
  return data;
}

export async function fetchNote(
  noteId: string,
): Promise<Awaited<ReturnType<NotesController['getNote']>>> {
  const { data } = await apiClient.get<
    Awaited<ReturnType<NotesController['getNote']>>
  >(`/notes/${noteId}`);
  return data;
}

export async function createNote(): Promise<
  Awaited<ReturnType<NotesController['createNote']>>
> {
  const { data } =
    await apiClient.post<Awaited<ReturnType<NotesController['createNote']>>>(
      '/notes',
    );
  return data;
}

export async function deleteNote(
  noteId: string,
): Promise<Awaited<ReturnType<NotesController['deleteNote']>>> {
  const { data } = await apiClient.delete<
    Awaited<ReturnType<NotesController['deleteNote']>>
  >(`/notes/${noteId}`);
  return data;
}

export async function createRequisite(
  noteId: string,
  body: CreateRequisiteDTO,
): Promise<Awaited<ReturnType<NotesController['createRequisite']>>> {
  const { data } = await apiClient.post<
    Awaited<ReturnType<NotesController['createRequisite']>>
  >(`/notes/${noteId}/requisites`, body);
  return data;
}

export async function updateRequisite(
  noteId: string,
  requisiteId: string,
  body: UpdateRequisiteDTO,
): Promise<Awaited<ReturnType<NotesController['updateRequisite']>>> {
  const { data } = await apiClient.patch<
    Awaited<ReturnType<NotesController['updateRequisite']>>
  >(`/notes/${noteId}/requisites/${requisiteId}`, body);
  return data;
}

export async function deleteRequisite(
  noteId: string,
  requisiteId: string,
): Promise<Awaited<ReturnType<NotesController['deleteRequisite']>>> {
  const { data } = await apiClient.delete<
    Awaited<ReturnType<NotesController['deleteRequisite']>>
  >(`/notes/${noteId}/requisites/${requisiteId}`);
  return data;
}

export async function addRequisiteTags(
  noteId: string,
  requisiteId: string,
  body: AddRequisiteTagsDTO,
): Promise<Awaited<ReturnType<NotesController['addRequisiteTags']>>> {
  const { data } = await apiClient.post<
    Awaited<ReturnType<NotesController['addRequisiteTags']>>
  >(`/notes/${noteId}/requisites/${requisiteId}/tags`, body);
  return data;
}

export async function removeRequisiteTag(
  noteId: string,
  requisiteId: string,
  tagId: string,
): Promise<Awaited<ReturnType<NotesController['removeRequisiteTag']>>> {
  const { data } = await apiClient.delete<
    Awaited<ReturnType<NotesController['removeRequisiteTag']>>
  >(`/notes/${noteId}/requisites/${requisiteId}/tags/${tagId}`);
  return data;
}
