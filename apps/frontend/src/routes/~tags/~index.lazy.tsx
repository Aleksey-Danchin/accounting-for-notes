import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  createTag,
  deleteTag,
  fetchTags,
  updateTag,
} from '__frontend/api/tagsApi';
import { AuthGuard } from '__frontend/services/auth';

export const Route = createLazyFileRoute('/tags/')({
  component: TagsPage,
});

function TagsPage() {
  return (
    <AuthGuard
      loading={<p>Checking session…</p>}
      fallback={<p>Sign in via Auth test to manage tags.</p>}
    >
      <TagsContent />
    </AuthGuard>
  );
}

function TagsContent() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#336699');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    data: tags,
    isPending,
    error: loadError,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['tags'] });

  const createMutation = useMutation({
    mutationFn: () =>
      createTag({
        name: name.trim(),
        color,
        description,
      }),
    onSuccess: async () => {
      setName('');
      setDescription('');
      setError(null);
      await invalidate();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Create failed');
    },
  });

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Tags</h1>

      <div className="mb-8 flex flex-wrap gap-3 border-b border-base-300 pb-6">
        <label className="form-control min-w-40">
          <span className="label-text">Name</span>
          <input
            className="input input-bordered input-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="form-control w-36">
          <span className="label-text">Color</span>
          <input
            type="color"
            className="input input-bordered input-sm h-9 p-1"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label className="form-control min-w-48 flex-1">
          <span className="label-text">Description</span>
          <input
            className="input input-bordered input-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary btn-sm self-end"
          disabled={!name.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          Create tag
        </button>
      </div>

      {error ? (
        <p role="alert" className="mb-4 text-error">
          {error}
        </p>
      ) : null}
      {isPending ? <p>Loading…</p> : null}
      {loadError ? (
        <p role="alert">
          Failed to load tags:{' '}
          {loadError instanceof Error ? loadError.message : 'Request failed'}
        </p>
      ) : null}

      {tags && tags.length === 0 ? (
        <p className="text-base-content/60">No tags yet.</p>
      ) : null}

      <ul className="space-y-3">
        {tags?.map((tag) => (
          <TagRow
            key={tag.id}
            tag={tag}
            onChanged={invalidate}
            onError={setError}
          />
        ))}
      </ul>
    </section>
  );
}

function TagRow({
  tag,
  onChanged,
  onError,
}: {
  tag: Awaited<ReturnType<typeof fetchTags>>[number];
  onChanged: () => Promise<unknown>;
  onError: (message: string | null) => void;
}) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [description, setDescription] = useState(tag.description);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateTag(tag.id, {
        name: name.trim(),
        color,
        description,
      }),
    onSuccess: async () => {
      onError(null);
      await onChanged();
    },
    onError: (err) => {
      onError(err instanceof Error ? err.message : 'Update failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTag(tag.id),
    onSuccess: async () => {
      onError(null);
      await onChanged();
    },
    onError: (err) => {
      onError(err instanceof Error ? err.message : 'Delete failed');
    },
  });

  return (
    <li className="flex flex-wrap items-end gap-3 border-b border-base-300 py-3">
      <span
        className="mb-2 inline-block h-4 w-4 rounded-full"
        style={{ backgroundColor: tag.color }}
        title={tag.color}
      />
      <label className="form-control min-w-40">
        <span className="label-text">Name</span>
        <input
          className="input input-bordered input-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="form-control w-36">
        <span className="label-text">Color</span>
        <input
          type="color"
          className="input input-bordered input-sm h-9 p-1"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </label>
      <label className="form-control min-w-48 flex-1">
        <span className="label-text">Description</span>
        <input
          className="input input-bordered input-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={saveMutation.isPending || !name.trim()}
        onClick={() => saveMutation.mutate()}
      >
        Save
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm text-error"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate()}
      >
        Delete
      </button>
    </li>
  );
}
