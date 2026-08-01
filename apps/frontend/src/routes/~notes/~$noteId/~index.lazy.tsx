import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { deleteNote, fetchNote } from '__frontend/api/notesApi';
import { AuthGuard } from '__frontend/services/auth';
import { NoteDocumentEdit } from '../NoteDocumentEdit';
import { NoteDocumentView } from '../NoteDocumentView';

export const Route = createLazyFileRoute('/notes/$noteId/')({
  component: NoteDocumentPage,
});

function NoteDocumentPage() {
  return (
    <AuthGuard
      loading={<p>Checking session…</p>}
      fallback={<p>Sign in via Auth test to open this note.</p>}
    >
      <NoteDocumentContent />
    </AuthGuard>
  );
}

function NoteDocumentContent() {
  const { noteId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const {
    data: note,
    isPending,
    error,
  } = useQuery({
    queryKey: ['notes', noteId],
    queryFn: () => fetchNote(noteId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      await navigate({ to: '/notes' });
    },
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/notes" className="link link-hover text-sm">
            ← Notes
          </Link>
          <h1 className="text-2xl font-semibold">Note document</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="join">
            <button
              type="button"
              className={`btn join-item btn-sm ${mode === 'view' ? 'btn-active' : ''}`}
              onClick={() => setMode('view')}
            >
              View
            </button>
            <button
              type="button"
              className={`btn join-item btn-sm ${mode === 'edit' ? 'btn-active' : ''}`}
              onClick={() => setMode('edit')}
            >
              Edit
            </button>
          </div>
          <button
            type="button"
            className="btn btn-error btn-outline btn-sm"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete note
          </button>
        </div>
      </div>

      {isPending ? <p>Loading…</p> : null}
      {error ? (
        <p role="alert">
          Failed to load note:{' '}
          {error instanceof Error ? error.message : 'Request failed'}
        </p>
      ) : null}
      {deleteMutation.error ? (
        <p role="alert" className="text-error">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : 'Delete failed'}
        </p>
      ) : null}

      {note && mode === 'view' ? <NoteDocumentView note={note} /> : null}
      {note && mode === 'edit' ? <NoteDocumentEdit note={note} /> : null}
    </section>
  );
}
