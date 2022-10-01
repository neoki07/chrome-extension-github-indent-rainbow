import detectIndent from "detect-indent";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/content/components/Demo");

const colors = [
  "rgba(255,255,64,0.07)",
  "rgba(127,255,127,0.07)",
  "rgba(255,127,255,0.07)",
  "rgba(79,236,236,0.07)",
];

const errorColor = "rgba(128,32,32,0.6)";

const tabmixColor = "rgba(128,32,96,0.6)";

const root = document.createElement("div");
root.id = "github-indent-rainbow-content-view-root";
document.body.prepend(root);

const fetchGithubContent = async (
  repo: string,
  branch: string,
  path: string
): Promise<any> => {
  return await fetch(
    encodeURI(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`)
  ).then((response) => response.text());
};

const onUpdate = async () => {
  const fileLineContainers = document.getElementsByClassName(
    "js-file-line-container"
  );

  if (fileLineContainers.length) {
    const url = location.href;
    const splitUrl = url.split("/");
    const repo = `${splitUrl[3]}/${splitUrl[4]}`;
    const branch = splitUrl[6];
    const path = splitUrl.slice(7).join("/");
    const content = await fetchGithubContent(repo, branch, path);
    const indentSize = detectIndent(content).amount;

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

        let currentIndent = firstLexeme;

        if (currentIndent.textContent.length % indentSize === 0) {
          let indentIndex = 0;
          while (currentIndent.textContent.length >= indentSize) {
            const nextIndent = currentIndent.splitText(indentSize);
            const coloredIndent = document.createElement("span");
            coloredIndent.innerText = currentIndent.textContent;

            const indentColor = colors[indentIndex % colors.length];
            coloredIndent.style.background = indentColor;
            coloredIndent.style.boxShadow = `0 -3px 0 0px ${indentColor}, 0 3px 0 0px ${indentColor}`;
            currentIndent.replaceWith(coloredIndent);

            indentIndex++;
            currentIndent = nextIndent;
          }
        } else {
          const coloredIndent = document.createElement("span");
          coloredIndent.innerText = currentIndent.textContent;
          coloredIndent.style.background = errorColor;
          coloredIndent.style.boxShadow = `0 -3px 0 0px ${errorColor}, 0 3px 0 0px ${errorColor}`;
          currentIndent.replaceWith(coloredIndent);
        }
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
