import {
  noteRequisites,
  payloadDescription,
  payloadValue,
  type NoteDto,
} from './noteUtils';

type NoteDocumentViewProps = {
  note: NoteDto;
};

export function NoteDocumentView({ note }: NoteDocumentViewProps) {
  const fields = noteRequisites(note);

  return (
    <section className="space-y-4">
      <p className="text-sm text-base-content/60">Note id: {note.id}</p>
      {fields.length === 0 ? (
        <p className="text-base-content/60">No requisites yet.</p>
      ) : (
        <ul className="divide-y divide-base-300">
          {fields.map((requisite) => (
            <li key={requisite.id} className="py-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-medium">{requisite.name}</span>
                <span className="badge badge-ghost badge-sm">{requisite.type}</span>
                {requisite.public ? (
                  <span className="badge badge-outline badge-sm">public</span>
                ) : null}
              </div>
              {payloadDescription(requisite) ? (
                <p className="mt-1 text-sm text-base-content/60">
                  {payloadDescription(requisite)}
                </p>
              ) : null}
              {requisite.type === 'tags' ? (
                <p className="mt-1">
                  {requisite.tags.map((link) => link.tag.name).join(', ') || '—'}
                </p>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">
                  {payloadValue(requisite) || '—'}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
