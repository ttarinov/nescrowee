import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useRef } from "react";

interface DescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DESCRIPTION_PLACEHOLDER =
  "Contract body: scope, deliverables, acceptance criteria. Type '/' for headings and lists.";

export default function DescriptionEditor({ value, onChange }: DescriptionEditorProps) {
  const editor = useCreateBlockNote({
    placeholders: {
      default: DESCRIPTION_PLACEHOLDER,
    },
    domAttributes: {
      editor: {
        class: "bn-description-editor-inner focus:outline-none",
      },
    },
  });
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!editor || hasInitialized.current) return;
    hasInitialized.current = true;
    if (value.trim()) {
      try {
        const blocks = editor.tryParseMarkdownToBlocks(value);
        editor.replaceBlocks(editor.document, blocks);
      } catch {
        // ignore parse errors, keep empty
      }
    }
  }, [editor, value]);

  return (
    <BlockNoteView
      editor={editor}
      theme="dark"
      editable={true}
      onChange={() => {
        try {
          const markdown = editor.blocksToMarkdownLossy(editor.document);
          onChange(markdown);
        } catch {
          // ignore
        }
      }}
      className="bn-editor-description bn-editor-theme-app bn-description-editor-wrap custom-scrollbar"
    />
  );
}
