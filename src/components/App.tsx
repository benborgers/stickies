import { useEffect, useRef } from "react";
import classNames from "classnames";
import { ArrowsOutCardinal, X } from "phosphor-react";
import Auth from "./Auth";
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

      <div
        className="h-screen relative overflow-hidden"
        ref={container}
        onClick={(event) => {
          if (event.target !== container.current) return;
          const now = new Date().getTime();
          const difference = now - lastContainerClick.current;
          lastContainerClick.current = now;
          if (difference > 300) return;
          createNote({ x: event.pageX, y: event.pageY });
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
  const x = useRef(note.x);
  const y = useRef(note.y);

  useEffect(() => {
    x.current = note.x;
    y.current = note.y;
  }, [note.x, note.y]);

  return (
    <div
      className="absolute"
      style={{ left: note.x, top: note.y, zIndex: note.z }}
      onMouseDown={() => {
        makeNoteHaveHighestZ(note.id);
      }}
    >
      <textarea
        className={classNames(
          "bg-yellow-100 shadow-sm border-2 border-yellow-200 resize",
          "min-h-[50px] min-w-[130px]",
          "focus:outline-none focus:ring-0 focus:border-yellow-300 transition-colors",
          "text-yellow-950 p-3 pr-6 text-sm font-medium"
        )}
        style={{ width: note.width, height: note.height }}
        value={note.text}
        onChange={(e) => {
          updateNoteKey(note.id, "text", e.target.value);
        }}
        onMouseUp={(event) => {
          const target = event.target as HTMLTextAreaElement;
          updateNoteKey(note.id, "width", target.offsetWidth);
          updateNoteKey(note.id, "height", target.offsetHeight);
        }}
      ></textarea>
      <div className="absolute top-1 right-1 grid grid-rows-2 gap-y-0.5">
        <button
          className="p-1 text-yellow-300 hover:text-yellow-500 transition-colors"
          onMouseDown={() => {
            function onMouseMove(event: MouseEvent) {
              x.current = x.current + event.movementX;
              y.current = y.current + event.movementY;
              updateNoteKey(note.id, "x", x.current, { persist: false });
              updateNoteKey(note.id, "y", y.current, { persist: false });
            }

            function onMouseUp() {
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
              updateNoteKey(note.id, "x", x.current);
              updateNoteKey(note.id, "y", y.current);
            }

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          }}
        >
          <ArrowsOutCardinal weight="bold" size={13} />
        </button>
        <button
          className="p-1 text-yellow-300 hover:text-yellow-500 transition-colors"
          onMouseDown={() => {
            if (confirm("Delete note?")) {
              deleteNote(note.id);
            }
          }}
        >
          <X weight="bold" size={13} />
        </button>
      </div>
    </div>
  );
}
