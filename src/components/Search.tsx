import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import tinykeys from "tinykeys";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
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
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (open === true) {
      setQuery("");
      onInputChange();
    }
  }, [open]);

  function scrollToResult(index: number) {
    const result = document.querySelector(
      `[data-result-index="${index}"]`
    ) as HTMLButtonElement;

    // @ts-ignore
    if (result.scrollIntoViewIfNeeded) {
      // @ts-ignore
      return result.scrollIntoViewIfNeeded();
    } else {
      return result.scrollIntoView();
    }
  }

  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+k": () => setOpen(true),
      ArrowUp: () => {
        if (!open) return;
        let nextVal = current - 1;
        if (nextVal < 0) {
          nextVal = results.length - 1;
        }
        setCurrent(nextVal);
        scrollToResult(nextVal);
      },
      ArrowDown: () => {
        if (!open) return;
        let nextVal = current + 1;
        if (nextVal > results.length - 1) {
          nextVal = 0;
        }
        setCurrent(nextVal);
        scrollToResult(nextVal);
      },
      Enter: () => {
        if (!open) return;
        if (results[current]) {
          unhideNote(results[current]);
        }
      },
    });

    return unsubscribe;
  }, [results, current, open]);

  async function onInputChange(event?: React.ChangeEvent<HTMLInputElement>) {
    const value = event ? event.target.value : "";
    setQuery(value);
    setCurrent(0);

    if (value.trim() === "") {
      return setResults(
        await pb.collection("notes").getFullList({
          filter: "hidden_at != null",
          sort: "-hidden_at",
          limit: 10,
        })
      );
    }

    setResults(
      await pb.collection("notes").getFullList({
        filter: `hidden_at != null && text ~ "${value}"`,
        sort: "-updated",
      })
    );
  }

  function unhideNote(note: Note) {
    setOpen(false);
    notesStore.set([...notes, note]);
    updateNoteKey(note.id, "hidden_at", "");
    updateNoteKey(note.id, "x", 24);
    updateNoteKey(note.id, "y", 24);
    makeNoteHaveHighestZ(note.id);
  }

  const emptyQuery = query.trim() === "";

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
            className="fixed inset-0 flex items-center justify-center p-4 bg-white/10 backdrop-blur-md"
          >
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-lg rounded-xl overflow-hidden bg-white shadow-lg text-gray-800 mb-32"
            >
              <input
                type="text"
                className="w-full border-0 focus:ring-0 p-4 border-b border-gray-100 focus:border-gray-100 placeholder:text-gray-300"
                placeholder="Search"
                value={query}
                onChange={onInputChange}
              />
              <div className="group max-h-80 overflow-scroll divide-y divide-gray-100">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    data-result-index={index}
                    className={classNames(
                      "block w-full p-4 text-left hover:bg-gray-100 transition-colors",
                      { "bg-gray-100": current === index }
                    )}
                    onClick={() => unhideNote(result)}
                  >
                    {removeHtml(result.text).trim() === "" ? (
                      <p className="text-sm font-medium text-gray-400">
                        Blank note
                      </p>
                    ) : (
                      <p
                        className="break-words"
                        dangerouslySetInnerHTML={{
                          __html: (() => {
                            const truncated = truncateResult(
                              removeHtml(result.text),
                              query
                            );

                            if (emptyQuery) {
                              return truncated;
                            }

                            return truncated.replace(
                              new RegExp(query.trim(), "gi"),
                              (match) =>
                                `<mark class="bg-amber-200">${match}</mark>`
                            );
                          })(),
                        }}
                      />
                    )}
                  </button>
                ))}

                {results.length === 0 && (
                  <p className="p-4 text-sm font-medium text-gray-400">
                    {emptyQuery ? "No hidden notes." : "No results found."}
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

function truncateResult(text: string, query: string) {
  const LENGTH = 150;

  let snippet = text.slice(0, LENGTH);

  if (query !== "" && !snippet.includes(query)) {
    const PREFIX = 30;
    snippet = text.slice(
      text.toLowerCase().indexOf(query.toLowerCase()) - PREFIX,
      text.toLowerCase().indexOf(query.toLowerCase()) - PREFIX + LENGTH
    );
  }

  let final = snippet.trim();

  if (!text.startsWith(snippet)) {
    final = "..." + final;
  }

  if (!text.endsWith(snippet)) {
    final = final + "...";
  }

  return final;
}
