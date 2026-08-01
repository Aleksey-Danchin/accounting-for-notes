import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type { ListActionsQueryDTO } from '__backend/src/actions/dto';
import { fetchAction, fetchActions } from '__frontend/api/actionsApi';
import { AuthGuard } from '__frontend/services/auth';

export const Route = createLazyFileRoute('/actions/')({
  component: ActionsPage,
});

function ActionsPage() {
  return (
    <AuthGuard
      loading={<p>Checking session…</p>}
      fallback={<p>Sign in via Auth test to view actions.</p>}
    >
      <ActionsContent />
    </AuthGuard>
  );
}

function ActionsContent() {
  const [typeFilter, setTypeFilter] = useState('');
  const [noteIdFilter, setNoteIdFilter] = useState('');
  const [tagIdFilter, setTagIdFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listParams: ListActionsQueryDTO = {
    ...(typeFilter
      ? { type: typeFilter as NonNullable<ListActionsQueryDTO['type']> }
      : {}),
    ...(noteIdFilter.trim() ? { noteId: noteIdFilter.trim() } : {}),
    ...(tagIdFilter.trim() ? { tagId: tagIdFilter.trim() } : {}),
  };

  const {
    data: actions,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['actions', listParams],
    queryFn: () => fetchActions(listParams),
  });

  const detailQuery = useQuery({
    queryKey: ['actions', 'detail', selectedId],
    queryFn: () => fetchAction(selectedId!),
    enabled: Boolean(selectedId),
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Actions</h1>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => void refetch()}
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <label className="form-control w-48">
          <span className="label-text">Type</span>
          <select
            className="select select-bordered select-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="login">login</option>
            <option value="login_failed">login_failed</option>
            <option value="logout">logout</option>
            <option value="create_note">create_note</option>
            <option value="update_note">update_note</option>
            <option value="delete_note">delete_note</option>
            <option value="create_tag">create_tag</option>
            <option value="update_tag">update_tag</option>
            <option value="delete_tag">delete_tag</option>
          </select>
        </label>
        <label className="form-control min-w-48 flex-1">
          <span className="label-text">noteId</span>
          <input
            className="input input-bordered input-sm"
            value={noteIdFilter}
            onChange={(e) => setNoteIdFilter(e.target.value)}
            placeholder="optional"
          />
        </label>
        <label className="form-control min-w-48 flex-1">
          <span className="label-text">tagId</span>
          <input
            className="input input-bordered input-sm"
            value={tagIdFilter}
            onChange={(e) => setTagIdFilter(e.target.value)}
            placeholder="optional"
          />
        </label>
      </div>

      {isPending ? <p>Loading…</p> : null}
      {error ? (
        <p role="alert">
          Failed to load actions:{' '}
          {error instanceof Error ? error.message : 'Request failed'}
        </p>
      ) : null}

      {actions && actions.length === 0 ? (
        <p className="text-base-content/60">No actions yet.</p>
      ) : null}

      <ul className="divide-y divide-base-300">
        {actions?.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              className={`w-full py-3 text-left transition-colors hover:bg-base-200/50 ${
                selectedId === action.id ? 'bg-base-200/70' : ''
              }`}
              onClick={() =>
                setSelectedId((current) =>
                  current === action.id ? null : action.id,
                )
              }
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="badge badge-ghost badge-sm">{action.type}</span>
                <span className="text-sm text-base-content/60">
                  {new Date(action.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-1 text-sm text-base-content/70">
                {action.noteId ? <span>note: {action.noteId}</span> : null}
                {action.noteId && action.tagId ? ' · ' : null}
                {action.tagId ? <span>tag: {action.tagId}</span> : null}
                {!action.noteId && !action.tagId ? (
                  <span>session / user event</span>
                ) : null}
              </div>
              {action.payload ? (
                <pre className="mt-1 overflow-x-auto text-xs text-base-content/60">
                  {JSON.stringify(action.payload)}
                </pre>
              ) : null}
            </button>

            {selectedId === action.id ? (
              <div className="mb-3 rounded-box border border-base-300 bg-base-200/30 p-3 text-sm">
                {detailQuery.isPending ? <p>Loading detail…</p> : null}
                {detailQuery.error ? (
                  <p role="alert" className="text-error">
                    {detailQuery.error instanceof Error
                      ? detailQuery.error.message
                      : 'Failed to load action'}
                  </p>
                ) : null}
                {detailQuery.data ? (
                  <pre className="overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(detailQuery.data, null, 2)}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
