import { useEffect, useRef } from "react";
import classNames from "classnames";
import { X } from "phosphor-react";
import Auth from "./Auth";
import LogOut from "./LogOut";
import {
  createNote,
  deleteNote,
  updateNoteKey,
  makeNoteHaveHighestZ,
} from "../stores/notes";
import useNotes from "../hooks/useNotes";
import type Note from "../types/note";

export default function () {
  const notes = useNotes();
  const container = useRef(null);

  const lastContainerClick = useRef(0);

  return (
    <div>
      <Auth />
      <LogOut />

      <div
        className="min-h-screen relative h-full"
        ref={container}
        onClick={(event) => {
          if (event.target !== container.current) return;
          const now = new Date().getTime();
          const difference = now - lastContainerClick.current;
          lastContainerClick.current = now;
          if (difference > 300) return;
          const tempId = createNote({ x: event.pageX, y: event.pageY });
        }}
      >
        {notes.map((note) => (
          <Note key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
function Note({ note }: { note: Note }) {
  return (
    <div
      data-note-id={note.id}
      className="absolute"
      style={{
        left: note.x,
        top: note.y,
        zIndex: note.z,
      }}
      onMouseDown={() => {
        makeNoteHaveHighestZ(note.id);
      }}
      draggable
    >
      <textarea
        className={classNames(
          "bg-yellow-100 h-72 w-72 shadow-sm border-2 border-yellow-200 resize-none",
          "focus:outline-none focus:ring-0 focus:border-yellow-300 transition-colors",
          "text-yellow-950 p-3"
        )}
        value={note.text}
        onChange={(e) => {
          updateNoteKey(note.id, "text", e.target.value);
        }}
      ></textarea>
      <button
        className="absolute top-1.5 right-1.5 p-1"
        onMouseDown={() => {
          if (confirm("Delete note?")) {
            deleteNote(note.id);
          }
        }}
      >
        <X
          weight="bold"
          className="text-yellow-300 hover:text-yellow-500 transition-colors"
        />
      </button>
    </div>
  );
}
