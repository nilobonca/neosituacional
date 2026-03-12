const { BlockNoteEditor } = require("@blocknote/core");

async function run() {
  const { BlockNoteEditor } = await import("@blocknote/core");
  const editor = BlockNoteEditor.create();
  
  editor.insertBlocks([
    {
      type: "image",
      props: {
        url: "https://example.com/image.jpg",
        caption: "Esta é uma legenda teste"
      }
    }
  ], editor.document[0], "after");

  const markdown = await editor.blocksToMarkdownLossy(editor.document);
  console.log("MARKDOWN OUTPUT:");
  console.log(markdown);
}

run().catch(console.error);
