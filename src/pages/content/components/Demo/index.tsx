import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/content/components/Demo");

const root = document.createElement("div");
root.id = "github-indent-rainbow-content-view-root";
document.body.prepend(root);

const onUpdate = () => {
  const fileLineContainers = document.getElementsByClassName(
    "js-file-line-container"
  );

  if (fileLineContainers.length) {
    const fileLines =
      fileLineContainers[0].getElementsByClassName("js-file-line");

    Array.from(fileLines).forEach((fileLine) => {
      const firstLexeme = fileLine.firstChild;

      if (firstLexeme instanceof Text) {
        const firstNotIndentCharIndex =
          firstLexeme.textContent.search(/[^\x20\t]/g);

        if (firstNotIndentCharIndex !== -1) {
          firstLexeme.splitText(firstNotIndentCharIndex);
        }

        firstLexeme.textContent = firstLexeme.textContent.replace(
          /[\x20\t]/g,
          "_"
        );
      }
    });
  }
};

const urlChangeObserver = new MutationObserver(() => {
  console.log("DOM changed!");
  urlChangeObserver.disconnect();
  onUpdate();
  urlChangeObserver.observe(document, { childList: true, subtree: true });
});

onUpdate();
urlChangeObserver.observe(document, { childList: true, subtree: true });
