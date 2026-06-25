import { useEffect, useState, useMemo } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useStorage } from "../hooks/useStorage";
import { ImagePicker } from "./ImagePicker";
import { Image as ImageIcon } from "lucide-react";

interface BlockEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  const { uploadImage } = useStorage();
  const handleUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (!url) {
      throw new Error("Falha no upload da imagem");
    }
    return url;
  };
  const editor = useCreateBlockNote({
    uploadFile: handleUpload,
  });

  const [initialContentSet, setInitialContentSet] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  useEffect(() => {
    async function loadMarkdown() {
      if (editor && initialContent && !initialContentSet) {
        const blocks = await editor.tryParseMarkdownToBlocks(initialContent);
        editor.replaceBlocks(editor.document, blocks);
        setInitialContentSet(true);
      } else if (editor && !initialContent && !initialContentSet) {
        setInitialContentSet(true);
      }
    }
    loadMarkdown();
  }, [editor, initialContent, initialContentSet]);
  if (!editor || !initialContentSet) {
    return (
      <div className="w-full px-4 py-8 border border-gray-300 rounded-lg text-center text-gray-500 bg-gray-50 animate-pulse">
        Carregando editor avançado...
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg bg-white overflow-hidden min-h-[500px] flex flex-col">
      <style>
        {`
          
          .bn-editor {
            flex-grow: 1;
            padding: 2rem 1rem !important;
            font-family: inherit;
          }
        `}
      </style>
      
      <div className="bg-white border-b border-gray-100 p-2 flex items-center justify-between">
        <div className="text-xs text-gray-400 pl-2">Editor de Texto Enriquecido</div>
        <button
          onClick={() => setShowGallery(true)}
          className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-4 py-2 rounded-md transition-colors border border-blue-200"
          type="button"
          title="Inserir imagem da galeria ou fazer upload"
        >
          <ImageIcon className="h-4 w-4" />
          Inserir Imagem / Galeria
        </button>
      </div>

      <BlockNoteView
        editor={editor}
        theme="light"
        formattingToolbar={true}
        onChange={async () => {
          const markdown = await editor.blocksToMarkdownLossy(editor.document);
          onChange(markdown);
        }}
      />

      {showGallery && (
        <ImagePicker 
          showCaptionField={true}
          onClose={() => setShowGallery(false)}
          onSelect={({ url, caption }) => {
            const currentBlock = editor.getTextCursorPosition().block;
            editor.insertBlocks(
              [
                {
                  type: "image",
                  props: {
                    url: url,
                    caption: caption || "",
                  },
                },
              ],
              currentBlock,
              "after"
            );
            setShowGallery(false);
          }}
        />
      )}
    </div>
  );
}
