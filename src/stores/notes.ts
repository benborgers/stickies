import { atom, onMount } from "nanostores";
import type Note from "../types/note";

import PocketBase from "pocketbase";
import {
  POCKETBASE_ENDPOINT,
  DEFAULT,
  DEFAULT_NOTE_WIDTH,
} from "../util/constants";
const pb = new PocketBase(POCKETBASE_ENDPOINT);

const notes = atom<Note[]>([]);
export default notes;

export function loadNotes() {
  pb.collection("notes")
    .getFullList({
      filter: "hidden = false",
    })
    .then((result) => {
      notes.set(result as unknown as Note[]);
    });
}

onMount(notes, loadNotes);

const dirtyNoteIds: Set<string> = new Set();
const recentlyUpdatedNoteIds: Set<string> = new Set();

setInterval(() => {
  recentlyUpdatedNoteIds.clear();
  for (const id of dirtyNoteIds) {
    pb.collection("notes").update(
      id,
      notes.get().find((note) => note.id === id)!
    );
    dirtyNoteIds.delete(id);
    recentlyUpdatedNoteIds.add(id);
  }
}, 500);

pb.collection("notes").subscribe("*", (event) => {
  if (event.action === "update") {
    notes.set(
      notes.get().map((note) => {
        if (
          note.id === event.record.id &&
          !recentlyUpdatedNoteIds.has(note.id)
        ) {
          return {
            ...note,
            ...event.record,
          };
        }
        return note;
      })
    );
  }
});

type UpdateNoteKeyOptions = {
  persist?: boolean;
};
export const updateNoteKey = (
  noteId: string,
  key: keyof Note,
  value: Note[typeof key],
  options?: UpdateNoteKeyOptions
) => {
  notes.set(
    notes.get().map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          [key]: value,
        };
      }
      return note;
    })
  );

  if (options?.persist ?? true) {
    dirtyNoteIds.add(noteId);
  }
};

export const createNote = ({ x, y }: { x: number; y: number }) => {
  const tempId = new Date().getTime().toString();

  const note: Note = {
    tempId,
    id: tempId,
    user: pb.authStore.model!.id,
    text: "",
    y,
    x,
    z: 999,
    width: DEFAULT_NOTE_WIDTH,
    height: DEFAULT_NOTE_WIDTH,
    hidden: false,
  };

  notes.set([...notes.get(), note]);
  makeNoteHaveHighestZ(tempId, { persist: false });

  pb.collection("notes")
    .create({ ...note, id: null })
    .then((result) => {
      window.tiptap_editors[tempId].commands.focus();

      updateNoteKey(tempId, "id", result.id, { persist: false });
      makeNoteHaveHighestZ(result.id);
    });
};

export const deleteNote = (noteId: string) => {
  notes.set(notes.get().filter((note) => note.id !== noteId));
  pb.collection("notes").delete(noteId);
};

export const makeNoteHaveHighestZ = (
  noteId: string,
  options?: UpdateNoteKeyOptions
) => {
  const sortedNotes = notes.get().sort((a, b) => a.z - b.z);
  for (let i = 0; i < sortedNotes.length; i++) {
    updateNoteKey(sortedNotes[i].id, "z", i, options);
  }
  updateNoteKey(noteId, "z", sortedNotes.length, options);
};
