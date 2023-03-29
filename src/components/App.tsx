import { useRef } from "react";
import { useStore } from "@nanostores/react";
import classNames from "classnames";
import Auth from "./Auth";
import LogOut from "./LogOut";
import useUser from "../hooks/useUser";
import notesStore, { createNote } from "../stores/notes";

export default function () {
  const { user } = useUser();
  const notes = useStore(notesStore);
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
          <textarea
            key={note.id}
            className={classNames(
              "absolute bg-yellow-100 h-72 w-72 shadow-sm border border-yellow-200 resize-none",
              "focus:border-2 focus:border-yellow-300 focus:ring-0 transition-colors",
              "text-yellow-950 p-3"
            )}
            style={{ left: note.x, top: note.y }}
          ></textarea>
        ))}
      </div>
    </div>
  );
}
