import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/content/components/Demo");

const root = document.createElement("div");
root.id = "github-indent-rainbow-content-view-root";
document.body.prepend(root);

const onUpdate = () => {
  const fileLineContainer = document.getElementsByClassName(
    "js-file-line-container"
  );

  root.innerText = fileLineContainer.length
    ? "This is a source code page (content view)"
    : "This is NOT a source code page (content view)";
};

const urlChangeObserver = new MutationObserver(() => {
  console.log("DOM changed!");
  urlChangeObserver.disconnect();
  onUpdate();
  urlChangeObserver.observe(document, { childList: true, subtree: true });
});

onUpdate();
urlChangeObserver.observe(document, { childList: true, subtree: true });
