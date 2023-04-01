import { useStore } from "@nanostores/react";
import notesStore from "../stores/notes";

export default function () {
  const notes = useStore(notesStore);

  const seenNoteIds: string[] = [];

  return notes
    .filter((n) => n.hidden_at === "")
    .filter((n) => {
      if (seenNoteIds.includes(n.id)) {
        return false;
      }
      seenNoteIds.push(n.id);
      return true;
    });
}
