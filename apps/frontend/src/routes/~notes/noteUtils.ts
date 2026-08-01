import type { NotesController } from '__backend/src/notes/notes.controller';

export type NoteDto = Awaited<ReturnType<NotesController['getNote']>>;
export type NoteRequisiteLink = NoteDto['requisites'][number];
export type RequisiteDto = NoteRequisiteLink['requisite'];

export function noteRequisites(note: NoteDto): RequisiteDto[] {
  return note.requisites.map((link) => link.requisite);
}

export function publicRequisites(note: NoteDto): RequisiteDto[] {
  return noteRequisites(note).filter((r) => r.public);
}

export function payloadValue(requisite: RequisiteDto): string {
  const payload = requisite.payload;
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  if ('value' in payload && typeof payload.value === 'string') {
    return payload.value;
  }
  return '';
}

export function payloadDescription(requisite: RequisiteDto): string {
  const payload = requisite.payload;
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  if ('description' in payload && typeof payload.description === 'string') {
    return payload.description;
  }
  return '';
}
