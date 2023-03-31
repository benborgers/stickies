import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: [
          "p-3 pr-6 h-full",
          "border-2 border-white rounded-xl",
          "focus:outline-none",
          "overflow-scroll",
          "bg-white/70 focus:bg-white/80 transition-colors",
          "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-6 [&_ol]:ml-6 [&_ul]:my-2 [&_ol]:my-2",
          "[&_h1]:font-bold",
        ].join(" "),
      },
    },
  });

  return <EditorContent editor={editor} className="h-full" />;
}
