import { Link } from '@tanstack/react-router';
import {
  payloadDescription,
  payloadValue,
  publicRequisites,
  type NoteDto,
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
      className="block border-b border-base-300 py-4 transition-colors hover:bg-base-200/40"
    >
      <p className="text-xs text-base-content/50">{note.id}</p>
      {fields.length === 0 ? (
        <p className="mt-1 text-base-content/60">No public fields</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {fields.map((requisite) => (
            <li key={requisite.id}>
              <span className="font-medium">{requisite.name}</span>
              {requisite.type === 'tags' ? (
                <span className="ml-2 text-sm text-base-content/70">
                  {requisite.tags
                    .map((link) => link.tag.name)
                    .filter(Boolean)
                    .join(', ') || '—'}
                </span>
              ) : (
                <span className="ml-2 text-sm text-base-content/70">
                  {payloadValue(requisite) || '—'}
                </span>
              )}
              {payloadDescription(requisite) ? (
                <span className="ml-2 text-xs text-base-content/50">
                  ({payloadDescription(requisite)})
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
