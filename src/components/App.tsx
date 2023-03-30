import { useRef } from "react";
import classNames from "classnames";
import { X } from "phosphor-react";
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
  const mouseDown = useRef(false);
  const deadzone = useRef<HTMLDivElement>(null);

  return (
    <div
      data-note-id={note.id}
      className="absolute"
      style={{
        left: note.x,
        top: note.y,
        zIndex: note.z,
      }}
      onMouseDown={(event) => {
        makeNoteHaveHighestZ(note.id);

        const deadzoneRect = deadzone.current?.getBoundingClientRect();
        if (!deadzoneRect) return;
        const deadzoneX = deadzoneRect.x + window.scrollX;
        const deadzoneY = deadzoneRect.y + window.scrollY;
        if (event.pageX > deadzoneX && event.pageY > deadzoneY) return;

        mouseDown.current = true;
      }}
      onMouseUp={() => {
        mouseDown.current = false;
        updateNoteKey(note.id, "x", note.x);
        updateNoteKey(note.id, "y", note.y);
      }}
      onMouseOut={() => {
        mouseDown.current = false;
      }}
      onMouseMove={(event) => {
        if (!mouseDown.current) return;
        updateNoteKey(note.id, "x", note.x + event.movementX, {
          persist: false,
        });
        updateNoteKey(note.id, "y", note.y + event.movementY, {
          persist: false,
        });
      }}
    >
      <div
        ref={deadzone}
        className="absolute bottom-0 right-0 h-6 w-6 pointer-events-none"
      />
      <textarea
        className={classNames(
          "bg-yellow-100 shadow-sm border-2 border-yellow-200 resize",
          "min-h-[50px] min-w-[130px]",
          "focus:outline-none focus:ring-0 focus:border-yellow-300 transition-colors",
          "text-yellow-950 p-3 pr-6 text-sm font-medium leading-relaxed"
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
      <button
        className="absolute top-1 right-1 p-1"
        onMouseDown={() => {
          if (confirm("Delete note?")) {
            deleteNote(note.id);
          }
        }}
      >
        <X
          weight="bold"
          size={13}
          className="text-yellow-300 hover:text-yellow-500 transition-colors"
        />
      </button>
    </div>
  );
}
