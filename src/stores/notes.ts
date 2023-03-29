import { atom } from "nanostores";
import type Note from "../types/note";

const notes = atom<Note[]>([]);
export default notes;

export const createNote = ({ x, y }: { x: number; y: number }) => {
  const tempId = new Date().getTime().toString();

  const note = {
    id: tempId,
    text: "",
    y,
    x,
  };

  notes.set([...notes.get(), note]);
};
