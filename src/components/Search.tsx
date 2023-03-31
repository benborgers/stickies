import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import tinykeys from "tinykeys";
import { AnimatePresence, motion } from "framer-motion";
import usePocketBase from "../hooks/usePocketBase";
import type Note from "../types/note";
import { makeNoteHaveHighestZ, updateNoteKey } from "../stores/notes";
import useNotes from "../hooks/useNotes";
import notesStore from "../stores/notes";

export default function () {
  const pb = usePocketBase();
  const notes = useNotes();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);

  useEffect(() => {
    if (open === true) {
      setQuery("");
      onInputChange();
    }
  }, [open]);

  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+k": () => setOpen(true),
    });

    return unsubscribe;
  }, []);

  async function onInputChange(event?: React.ChangeEvent<HTMLInputElement>) {
    const value = event ? event.target.value : "";
    setQuery(value);

    if (value.trim() === "") {
      return setResults(
        await pb.collection("notes").getFullList({
          filter: "hidden = true",
          sort: "-updated",
          limit: 10,
        })
      );
    }

    setResults(
      await pb.collection("notes").getFullList({
        filter: `hidden = true && text ~ "${encodeURIComponent(value)}"`,
        sort: "-updated",
      })
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          static
          open={open}
          onClose={() => setOpen(false)}
          className="relative z-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 bg-white/30 backdrop-blur-sm"
          >
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-lg rounded-xl overflow-hidden bg-white shadow-lg text-gray-800"
            >
              <input
                type="text"
                className="w-full border-0 focus:ring-0 p-4 border-b border-gray-100 focus:border-gray-100 placeholder:text-gray-300"
                placeholder="Search"
                value={query}
                onChange={onInputChange}
              />
              <div className="max-h-80 overflow-scroll divide-y divide-gray-100">
                {results.map((result) => (
                  <button
                    key={result.id}
                    className="p-4 block w-full text-left hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setOpen(false);
                      notesStore.set([...notes, result]);
                      updateNoteKey(result.id, "hidden", false);
                      updateNoteKey(result.id, "x", 24);
                      updateNoteKey(result.id, "y", 24);
                      makeNoteHaveHighestZ(result.id);
                    }}
                  >
                    <p className="">
                      {result.text.trim() === ""
                        ? "Blank"
                        : removeHtml(result.text)}
                    </p>
                  </button>
                ))}

                {results.length === 0 && (
                  <p className="p-4 text-sm font-medium text-gray-400">
                    {query.trim() === ""
                      ? "No hidden notes."
                      : "No results found."}
                  </p>
                )}
              </div>
            </Dialog.Panel>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

function removeHtml(html: string) {
  return html.replace(/<.+?>/gm, " ").replace(/\s+/gm, " ");
}
