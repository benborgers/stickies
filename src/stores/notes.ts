import { atom } from "nanostores";
import type Note from "../types/note";

import PocketBase from "pocketbase";
const pb = new PocketBase("https://pb-stickies.elk.sh");

const notes = atom<Note[]>([]);
export default notes;

const updateNoteKeyDebounceTimeouts: Record<string, number> = {};

export const updateNoteKey = (
  noteId: string,
  key: keyof Note,
  value: Note[typeof key]
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

  const debounceKey = `${noteId}-${key}`;
  clearTimeout(updateNoteKeyDebounceTimeouts[debounceKey]);
  updateNoteKeyDebounceTimeouts[debounceKey] = setTimeout(() => {
    pb.collection("notes").update(noteId, { [key]: value });
  }, 300);
};

export const createNote = ({ x, y }: { x: number; y: number }) => {
  const tempId = new Date().getTime().toString();

  const note: Note = {
    id: tempId,
    text: "",
    y,
    x,
    z: new Date().getTime(),
    user: pb.authStore.model!.id,
  };

  notes.set([...notes.get(), note]);

  pb.collection("notes")
    .create({ ...note, id: null })
    .then((result) => {
      updateNoteKey(tempId, "id", result.id);
    });
};

export const deleteNote = (noteId: string) => {
  notes.set(notes.get().filter((note) => note.id !== noteId));
  pb.collection("notes").delete(noteId);
};
