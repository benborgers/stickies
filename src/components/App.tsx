import { useEffect, useRef } from "react";
import classNames from "classnames";
import { ArrowsOutCardinal, MinusCircle, XCircle } from "phosphor-react";
import Auth from "./Auth";
import {
  createNote,
  deleteNote,
  updateNoteKey,
  makeNoteHaveHighestZ,
} from "../stores/notes";
import useNotes from "../hooks/useNotes";
import type Note from "../types/note";
import Tiptap from "./Tiptap";
import { AnimatePresence, motion } from "framer-motion";
import Search from "./Search";

export default function () {
  const notes = useNotes();
  const container = useRef(null);

  const lastContainerClick = useRef(0);

  return (
    <div>
      <Auth />
      <Search />

      <div
        className="h-screen relative overflow-hidden bg-gradient-to-b from-violet-200 via-violet-300 to-violet-300"
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
        <AnimatePresence>
          {notes.map((note) => (
            <Note key={note.tempId ?? note.id} note={note} />
          ))}
        </AnimatePresence>
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

  const width = useRef(note.width);
  const height = useRef(note.height);

  useEffect(() => {
    width.current = note.width;
    height.current = note.height;
  }, [note.width, note.height]);

  return (
    <motion.div
      key={note.tempId ?? note.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={classNames(
        "absolute overflow-hidden",
        "shadow rounded-xl backdrop-blur-md",
        "[&::-webkit-resizer]:hidden",
        "min-h-[85px] min-w-[130px]",
        "text-gray-950 text-sm font-medium"
      )}
      style={{
        left: note.x,
        top: note.y,
        zIndex: note.z,
        height: width.current,
        width: height.current,
      }}
      onMouseDown={() => {
        makeNoteHaveHighestZ(note.id);
      }}
    >
      <Tiptap
        value={note.text}
        setValue={(value) => updateNoteKey(note.id, "text", value)}
      />
      <div className="absolute top-1.5 right-1.5 grid grid-rows-3 justify-items-center">
        <button
          className="p-1 text-gray-950/10 hover:text-gray-950/40 transition-colors"
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
          className="p-1 text-gray-950/10 hover:text-gray-950/40 transition-colors"
          onMouseDown={() => {
            updateNoteKey(note.id, "hidden", true);
          }}
        >
          <MinusCircle weight="bold" size={15} />
        </button>
        <button
          className="p-1 text-gray-950/10 hover:text-gray-950/40 transition-colors"
          onMouseDown={() => {
            if (confirm("Delete note?")) {
              requestAnimationFrame(() => {
                deleteNote(note.id);
              });
            }
          }}
        >
          <XCircle weight="bold" size={15} />
        </button>
      </div>
      <button
        className="cursor-se-resize h-5 w-5 absolute bottom-0 right-0"
        onMouseDown={() => {
          function onMouseMove(event: MouseEvent) {
            width.current = width.current + event.movementY;
            height.current = height.current + event.movementX;
            updateNoteKey(note.id, "width", width.current, {
              persist: false,
            });
            updateNoteKey(note.id, "height", height.current, {
              persist: false,
            });
          }

          function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            updateNoteKey(note.id, "width", width.current);
            updateNoteKey(note.id, "height", height.current);
          }

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      />
    </motion.div>
  );
}
