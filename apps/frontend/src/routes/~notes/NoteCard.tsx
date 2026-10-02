import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import {
  payloadValue,
  publicRequisites,
  type NoteDto,
  type RequisiteDto,
} from './noteUtils';

type NoteCardProps = {
  note: NoteDto;
};

export function NoteCard({ note }: NoteCardProps) {
  const fields = publicRequisites(note);

  return (
    <Link
      to="/notes/$noteId"
      params={{ noteId: note.id }}
      className="block h-full rounded-lg border border-base-300 p-3 transition-colors hover:bg-base-200/40"
    >
      {fields.length === 0 ? (
        <p className="text-sm text-base-content/50">Empty</p>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((requisite) => (
            <PublicRequisiteView key={requisite.id} requisite={requisite} />
          ))}
        </div>
      )}
    </Link>
  );
}

function PublicRequisiteView({
  requisite,
}: {
  requisite: RequisiteDto;
}): ReactNode {
  switch (requisite.type) {
    case 'title': {
      const value = payloadValue(requisite);
      if (!value) return null;
      return (
        <p className="line-clamp-2 text-base font-semibold leading-snug">
          {value}
        </p>
      );
    }
    case 'text': {
      const value = payloadValue(requisite);
      if (!value) return null;
      return (
        <p className="line-clamp-3 text-sm leading-snug text-base-content/70">
          {value}
        </p>
      );
    }
    case 'tags': {
      const tags = requisite.tags
        .map((link) => link.tag)
        .filter((tag) => Boolean(tag.name));
      if (tags.length === 0) return null;
      return (
        <div className="flex max-h-16 flex-wrap gap-1 overflow-hidden">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="badge badge-sm border bg-transparent font-normal"
              style={{ borderColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      );
    }
    default: {
      const value = payloadValue(requisite);
      if (!value) return null;
      return (
        <p className="line-clamp-2 text-sm text-base-content/70">{value}</p>
      );
    }
  }
}
