import { useEffect, useRef } from "react";
import classNames from "classnames";
import { ArrowsOutCardinal, MinusCircle, XCircle } from "phosphor-react";
import tinykeys from "tinykeys";
import { useStore } from "@nanostores/react";
import userStore from "../stores/user";
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
import ThemePicker from "./ThemePicker";
import {
  DEFAULT_NOTE_WIDTH,
  MIN_NOTE_WIDTH,
  MIN_NOTE_HEIGHT,
} from "../util/constants";

export default function () {
  const user = useStore(userStore);
  const notes = useNotes();
  const container = useRef(null);

  const lastContainerClick = useRef(0);

  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      n: (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.contentEditable === "true") {
          return;
        }
        createNote({ x: 24, y: 24 });
      },
      Escape: () => {
        for (const id in window.tiptap_editors) {
          window.tiptap_editors[id].commands.blur();
        }
      },
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      <Auth />
      <Search />
      <ThemePicker />

      <div
        className={classNames(
          "min-h-screen min-w-[100vw] relative overflow-hidden isolate bg-gradient-to-b",
          user?.theme || "from-violet-200 via-violet-300 to-violet-300"
        )}
        style={{
          height:
            notes.length > 0
              ? Math.max(...notes.map((note) => note.y + note.height))
              : 0,
          width:
            notes.length > 0
              ? Math.max(...notes.map((note) => note.x + note.width))
              : 0,
        }}
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
        <div
          style={{
            backgroundImage:
              'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")',
            backgroundSize: 100,
          }}
          className="fixed inset-0 opacity-5 pointer-events-none"
        />
        <AnimatePresence>
          {notes.map((note) => (
            <Note key={note.tempId ?? note.id} note={note} />
          ))}
        </AnimatePresence>
      </div>

      <p className="text-white/70 fixed left-3 bottom-3 font-semibold text-xs [text-shadow:1px_1px_3px_rgba(0,0,0,0.05)]">
        ⌘K to search hidden notes
      </p>
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
        "text-gray-950 text-sm font-medium"
      )}
      style={{
        left: note.x,
        top: note.y,
        zIndex: note.z,
        width: width.current,
        height: height.current,
      }}
      onMouseDown={() => {
        makeNoteHaveHighestZ(note.id);
      }}
    >
      <Tiptap
        id={note.id}
        value={note.text}
        setValue={(value) => updateNoteKey(note.id, "text", value)}
      />
      <div className="absolute top-1.5 right-1.5 grid grid-rows-3 justify-items-center">
        <button
          className="p-1 text-gray-950/10 hover:text-gray-950/40 transition-colors"
          onMouseDown={(event) => {
            if (event.metaKey) {
              width.current = DEFAULT_NOTE_WIDTH;
              height.current = DEFAULT_NOTE_WIDTH;
              updateNoteKey(note.id, "width", width.current);
              updateNoteKey(note.id, "height", height.current);
              return;
            }

            function onMouseMove(event: MouseEvent) {
              x.current = x.current + event.movementX;
              y.current = y.current + event.movementY;

              if (x.current < 0) x.current = 0;
              if (y.current < 0) y.current = 0;
              if (x.current + width.current > window.innerWidth)
                x.current = window.innerWidth - width.current;
              if (y.current + height.current > window.innerHeight)
                y.current = window.innerHeight - height.current;

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
            updateNoteKey(note.id, "hidden_at", new Date());
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
            width.current = width.current + event.movementX;
            height.current = height.current + event.movementY;

            if (width.current < MIN_NOTE_WIDTH) width.current = MIN_NOTE_WIDTH;
            if (height.current < MIN_NOTE_HEIGHT)
              height.current = MIN_NOTE_HEIGHT;
            if (note.x + width.current > window.innerWidth)
              width.current = window.innerWidth - note.x;
            if (note.y + height.current > window.innerHeight)
              height.current = window.innerHeight - note.y;

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
