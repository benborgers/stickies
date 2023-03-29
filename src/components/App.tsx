import { useRef } from "react";
import classNames from "classnames";
import { X } from "phosphor-react";
import Auth from "./Auth";
import LogOut from "./LogOut";
import { createNote, deleteNote, updateNoteKey } from "../stores/notes";
import useNotes from "../hooks/useNotes";

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
          createNote({ x: event.pageX, y: event.pageY });
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute"
            style={{ left: note.x, top: note.y, zIndex: note.z }}
          >
            <textarea
              className={classNames(
                "bg-yellow-100 h-72 w-72 shadow-sm border border-yellow-200 resize-none",
                "focus:border-2 focus:border-yellow-300 focus:ring-0 transition-colors",
                "text-yellow-950 p-3"
              )}
              value={note.text}
              onChange={(e) => {
                updateNoteKey(note.id, "text", e.target.value);
              }}
            ></textarea>
            <button
              className="absolute top-1.5 right-1.5 p-1"
              onClick={() => {
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
        ))}
      </div>
    </div>
  );
}
