import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { CreateRequisiteDTO } from '__backend/src/notes/dto';
import {
  addRequisiteTags,
  createRequisite,
  deleteRequisite,
  removeRequisiteTag,
  updateRequisite,
} from '__frontend/api/notesApi';
import { fetchTags } from '__frontend/api/tagsApi';
import {
  noteRequisites,
  payloadDescription,
  payloadValue,
  type NoteDto,
  type RequisiteDto,
} from './noteUtils';

type NoteDocumentEditProps = {
  note: NoteDto;
};

type CreateType = CreateRequisiteDTO['type'];

export function NoteDocumentEdit({ note }: NoteDocumentEditProps) {
  const queryClient = useQueryClient();
  const fields = noteRequisites(note);
  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const [createType, setCreateType] = useState<CreateType>('title');
  const [createName, setCreateName] = useState('');
  const [createValue, setCreateValue] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPublic, setCreatePublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['notes'] });
    await queryClient.invalidateQueries({ queryKey: ['notes', note.id] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const base = {
        name: createName.trim(),
        public: createPublic,
      };
      const body: CreateRequisiteDTO =
        createType === 'tags'
          ? {
              ...base,
              type: 'tags',
              payload: createDescription
                ? { description: createDescription }
                : undefined,
            }
          : {
              ...base,
              type: createType,
              payload: {
                value: createValue,
                ...(createDescription
                  ? { description: createDescription }
                  : {}),
              },
            };
      return createRequisite(note.id, body);
    },
    onSuccess: async () => {
      setCreateName('');
      setCreateValue('');
      setCreateDescription('');
      setCreatePublic(false);
      setError(null);
      await invalidate();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Create failed');
    },
  });

  return (
    <section className="space-y-6">
      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}

      <div className="space-y-3 border-b border-base-300 pb-6">
        <h2 className="text-lg font-medium">Add requisite</h2>
        <div className="flex flex-wrap gap-3">
          <label className="form-control w-40">
            <span className="label-text">Type</span>
            <select
              className="select select-bordered select-sm"
              value={createType}
              onChange={(e) => setCreateType(e.target.value as CreateType)}
            >
              <option value="title">title</option>
              <option value="text">text</option>
              <option value="tags">tags</option>
            </select>
          </label>
          <label className="form-control min-w-48 flex-1">
            <span className="label-text">Name</span>
            <input
              className="input input-bordered input-sm"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
          </label>
          {createType !== 'tags' ? (
            <label className="form-control min-w-48 flex-1">
              <span className="label-text">Value</span>
              <input
                className="input input-bordered input-sm"
                value={createValue}
                onChange={(e) => setCreateValue(e.target.value)}
              />
            </label>
          ) : null}
          <label className="form-control min-w-48 flex-1">
            <span className="label-text">Description</span>
            <input
              className="input input-bordered input-sm"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
            />
          </label>
          <label className="label cursor-pointer gap-2 self-end">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={createPublic}
              onChange={(e) => setCreatePublic(e.target.checked)}
            />
            <span className="label-text">Public</span>
          </label>
          <button
            type="button"
            className="btn btn-primary btn-sm self-end"
            disabled={!createName.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Add
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {fields.map((requisite) => (
          <RequisiteEditor
            key={`${requisite.id}-${requisite.updatedAt}`}
            noteId={note.id}
            requisite={requisite}
            allTags={allTags}
            onChanged={invalidate}
            onError={setError}
          />
        ))}
      </ul>
    </section>
  );
}

type TagOption = Awaited<ReturnType<typeof fetchTags>>[number];

function RequisiteEditor({
  noteId,
  requisite,
  allTags,
  onChanged,
  onError,
}: {
  noteId: string;
  requisite: RequisiteDto;
  allTags: TagOption[];
  onChanged: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [name, setName] = useState(requisite.name);
  const [value, setValue] = useState(payloadValue(requisite));
  const [description, setDescription] = useState(
    payloadDescription(requisite),
  );
  const [isPublic, setIsPublic] = useState(requisite.public);
  const [selectedTagId, setSelectedTagId] = useState('');

  const saveMutation = useMutation({
    mutationFn: () =>
      updateRequisite(noteId, requisite.id, {
        name: name.trim(),
        public: isPublic,
        payload:
          requisite.type === 'tags'
            ? description
              ? { description }
              : {}
            : {
                value,
                ...(description ? { description } : {}),
              },
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
    mutationFn: () => deleteRequisite(noteId, requisite.id),
    onSuccess: async () => {
      onError(null);
      await onChanged();
    },
    onError: (err) => {
      onError(err instanceof Error ? err.message : 'Delete failed');
    },
  });

  const addTagMutation = useMutation({
    mutationFn: (tagId: string) =>
      addRequisiteTags(noteId, requisite.id, { tagIds: [tagId] }),
    onSuccess: async () => {
      setSelectedTagId('');
      onError(null);
      await onChanged();
    },
    onError: (err) => {
      onError(err instanceof Error ? err.message : 'Add tag failed');
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: (tagId: string) =>
      removeRequisiteTag(noteId, requisite.id, tagId),
    onSuccess: async () => {
      onError(null);
      await onChanged();
    },
    onError: (err) => {
      onError(err instanceof Error ? err.message : 'Remove tag failed');
    },
  });

  const linkedTagIds = new Set(requisite.tags.map((link) => link.tagId));
  const availableTags = allTags.filter((tag) => !linkedTagIds.has(tag.id));

  return (
    <li className="rounded-box border border-base-300 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="badge badge-ghost">{requisite.type}</span>
        <button
          type="button"
          className="btn btn-ghost btn-xs text-error"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
        >
          Delete
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="form-control min-w-40 flex-1">
          <span className="label-text">Name</span>
          <input
            className="input input-bordered input-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {requisite.type !== 'tags' ? (
          <label className="form-control min-w-40 flex-1">
            <span className="label-text">Value</span>
            <input
              className="input input-bordered input-sm"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
        ) : null}
        <label className="form-control min-w-40 flex-1">
          <span className="label-text">Description</span>
          <input
            className="input input-bordered input-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="label cursor-pointer gap-2 self-end">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <span className="label-text">Public</span>
        </label>
        <button
          type="button"
          className="btn btn-primary btn-sm self-end"
          disabled={saveMutation.isPending || !name.trim()}
          onClick={() => saveMutation.mutate()}
        >
          Save
        </button>
      </div>

      {requisite.type === 'tags' ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Linked tags</p>
          <ul className="flex flex-wrap gap-2">
            {requisite.tags.map((link) => (
              <li key={link.tagId}>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  style={{ borderColor: link.tag.color }}
                  disabled={removeTagMutation.isPending}
                  onClick={() => removeTagMutation.mutate(link.tagId)}
                >
                  {link.tag.name} ×
                </button>
              </li>
            ))}
            {requisite.tags.length === 0 ? (
              <li className="text-sm text-base-content/60">None</li>
            ) : null}
          </ul>
          <div className="flex flex-wrap gap-2">
            <select
              className="select select-bordered select-sm"
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
            >
              <option value="">Select tag…</option>
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={!selectedTagId || addTagMutation.isPending}
              onClick={() => addTagMutation.mutate(selectedTagId)}
            >
              Attach tag
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
