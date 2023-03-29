import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import notesStore from "../stores/notes";
import type Note from "../types/note";
import usePocketBase from "./usePocketBase";

export default function () {
  const pb = usePocketBase();
  const notes = useStore(notesStore);

  useEffect(() => {
    pb.collection("notes")
      .getFullList()
      .then((notes) => {
        notesStore.set(notes as unknown as Note[]);
      });
  }, []);

  return notes;
}
