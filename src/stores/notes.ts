import { atom } from "nanostores";
import type Note from "../types/note";

import PocketBase from "pocketbase";
const pb = new PocketBase("https://pb-stickies.elk.sh");

const notes = atom<Note[]>([]);
export default notes;

const dirtyNoteIds: Set<string> = new Set();

setInterval(() => {
  for (const id of dirtyNoteIds) {
    pb.collection("notes").update(
      id,
      notes.get().find((note) => note.id === id)!
    );
    dirtyNoteIds.delete(id);
  }
}, 500);

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
    id: tempId,
    text: "",
    y,
    x,
    z: 0,
    user: pb.authStore.model!.id,
  };

  notes.set([...notes.get(), note]);
  makeNoteHaveHighestZ(tempId, { persist: false });

  pb.collection("notes")
    .create({ ...note, id: null })
    .then((result) => {
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
