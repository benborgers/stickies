import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import notesStore from "../stores/notes";
import type Note from "../types/note";
import usePocketBase from "./usePocketBase";
import useUser from "./useUser";

export default function () {
  const pb = usePocketBase();
  const { user } = useUser();
  const notes = useStore(notesStore);

  useEffect(() => {
    if (!user) return;
    pb.collection("notes")
      .getFullList({
        filter: "hidden = false",
      })
      .then((notes) => {
        notesStore.set(notes as unknown as Note[]);
      });
  }, [user]);

  const seenNoteIds: string[] = [];

  return notes
    .filter((n) => n.hidden === false)
    .filter((n) => {
      if (seenNoteIds.includes(n.id)) {
        return false;
      }
      seenNoteIds.push(n.id);
      return true;
    });
}
