import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

export default function ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem],
    content: value,
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: [
          "tiptap",
          "p-3 pr-6 h-full",
          "border-2 border-white rounded-xl",
          "focus:outline-none",
          "overflow-scroll",
          "bg-white/70 focus:bg-white/80 transition-colors",
        ].join(" "),
      },
    },
  });

  return <EditorContent editor={editor} className="h-full" />;
}
