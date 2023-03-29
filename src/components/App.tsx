import { useStore } from "@nanostores/react";
import Auth from "./Auth";
import LogOut from "./LogOut";
import useUser from "../hooks/useUser";
import notesStore, { createNote } from "../stores/notes";
import { useRef } from "react";

export default function () {
  const { user } = useUser();
  const notes = useStore(notesStore);
  const container = useRef(null);

  return (
    <div>
      <Auth />
      <LogOut />

      <div
        className="min-h-screen relative bg-red-100 h-full"
        ref={container}
        onClick={(event) => {
          if (event.target !== container.current) return;
          createNote({ x: event.pageX, y: event.pageY });
        }}
      >
        {notes.map((note) => (
          <textarea
            key={note.id}
            className="absolute bg-yellow-100 0 h-72 w-72 shadow-sm border border-yellow-200 resize-none focus:border-2 focus:border-yellow-300 focus:ring-0 transition-colors"
            style={{ left: note.x, top: note.y }}
          ></textarea>
        ))}
      </div>
    </div>
  );
}
