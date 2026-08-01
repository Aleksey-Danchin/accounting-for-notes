import { useMutation, useQuery } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { createNote, fetchNotes } from '__frontend/api/notesApi';
import { AuthGuard } from '__frontend/services/auth';
import { NoteCard } from './NoteCard';

export const Route = createLazyFileRoute('/notes/')({
  component: NotesPage,
});

function NotesPage() {
  return (
    <AuthGuard
      loading={<p>Checking session…</p>}
      fallback={<p>Sign in via Auth test to manage notes.</p>}
    >
      <NotesContent />
    </AuthGuard>
  );
}

function NotesContent() {
  const navigate = useNavigate();
  const {
    data: notes,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async (note) => {
      await navigate({ to: '/notes/$noteId', params: { noteId: note.id } });
    },
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          New note
        </button>
      </div>

      {isPending ? <p>Loading…</p> : null}
      {error ? (
        <p role="alert">
          Failed to load notes:{' '}
          {error instanceof Error ? error.message : 'Request failed'}
        </p>
      ) : null}
      {createMutation.error ? (
        <p role="alert" className="text-error">
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : 'Create failed'}
        </p>
      ) : null}

      {notes && notes.length === 0 ? (
        <p className="text-base-content/60">No notes yet.</p>
      ) : null}

      {notes && notes.length > 0 ? (
        <div>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="btn btn-ghost btn-sm mt-4"
        onClick={() => void refetch()}
      >
        Refresh
      </button>
    </section>
  );
}
