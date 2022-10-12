import detectIndent from "detect-indent";

const colors = [
  "rgba(255,255,64,0.07)",
  "rgba(127,255,127,0.07)",
  "rgba(255,127,255,0.07)",
  "rgba(79,236,236,0.07)",
];

const errorColor = "rgba(128,32,32,0.6)";
const tabmixColor = "rgba(128,32,96,0.6)";
const borderColor = "rgba(255,255,255,0.1)";

const root = document.createElement("div");
root.id = "github-indent-rainbow-content-view-root";
document.body.prepend(root);

const enum CharCode {
  /**
   * The `\t` character.
   */
  Tab = 9,
  Space = 32,
}

const getLineCount = (lines: string[]): number => {
  return lines.length;
};

const computeIndentLevel = (line: string, tabSize: number): number => {
  let indent = 0;
  let i = 0;
  const len = line.length;

  while (i < len) {
    const chCode = line.charCodeAt(i);
    if (chCode === CharCode.Space) {
      indent++;
    } else if (chCode === CharCode.Tab) {
      indent = indent - (indent % tabSize) + tabSize;
    } else {
      break;
    }
    i++;
  }

  if (i === len) {
    return -1; // line only consists of whitespace
  }

  return indent;
};

const getIndentLevelForWhitespaceLine = (
  indentSize: number,
  offSide: boolean,
  aboveContentLineIndent: number,
  belowContentLineIndent: number
): number => {
  if (aboveContentLineIndent === -1 || belowContentLineIndent === -1) {
    // At the top or bottom of the file
    return 0;
  } else if (aboveContentLineIndent < belowContentLineIndent) {
    // we are inside the region above
    return 1 + Math.floor(aboveContentLineIndent / indentSize);
  } else if (aboveContentLineIndent === belowContentLineIndent) {
    // we are in between two regions
    return Math.ceil(belowContentLineIndent / indentSize);
  } else {
    if (offSide) {
      // same level as region below
      return Math.ceil(belowContentLineIndent / indentSize);
    } else {
      // we are inside the region that ends below
      return 1 + Math.floor(belowContentLineIndent / indentSize);
    }
  }
};

const getLinesIndentGuides = (lines: string[], indentSize: number) => {
  const lineCount = getLineCount(lines);

  const offSide = false;

  const result: number[] = new Array<number>(lineCount);

  let aboveContentLineIndex =
    -2; /* -2 is a marker for not having computed it */
  let aboveContentLineIndent = -1;

  let belowContentLineIndex =
    -2; /* -2 is a marker for not having computed it */
  let belowContentLineIndent = -1;

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const line = lines[lineNumber - 1];

    const resultIndex = lineNumber;

    const currentIndent = computeIndentLevel(line, lineNumber);
    if (currentIndent >= 0) {
      // This line has content (besides whitespace)
      // Use the line's indent
      aboveContentLineIndex = lineNumber - 1;
      aboveContentLineIndent = currentIndent;
      result[resultIndex] = Math.ceil(currentIndent / indentSize);

      continue;
    }

    if (aboveContentLineIndex === -2) {
      aboveContentLineIndex = -1;
      aboveContentLineIndent = -1;

      // must find previous line with content
      for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
        const indent = computeIndentLevel(line, lineIndex);
        if (indent >= 0) {
          aboveContentLineIndex = lineIndex;
          aboveContentLineIndent = indent;
          break;
        }
      }
    }

    if (
      belowContentLineIndex !== -1 &&
      (belowContentLineIndex === -2 || belowContentLineIndex < lineNumber - 1)
    ) {
      belowContentLineIndex = -1;
      belowContentLineIndent = -1;

      // must find next line with content
      for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
        const indent = computeIndentLevel(line, lineIndex);
        if (indent >= 0) {
          belowContentLineIndex = lineIndex;
          belowContentLineIndent = indent;
          break;
        }
      }
    }

    result[resultIndex] = getIndentLevelForWhitespaceLine(
      indentSize,
      offSide,
      aboveContentLineIndent,
      belowContentLineIndent
    );
  }
  return result;
};

const getGuidesByLine = (lines: string[], indentSize: number) => {
  const indentGuides = getLinesIndentGuides(lines, indentSize);
};

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

    const githubTabSize = Number(
      fileLineContainers[0].getAttribute("data-tab-size")
    );

    const indent = detectIndent(content);
    const indentType = indent.type;
    const indentSize =
      indent.amount * (indentType === "tab" ? githubTabSize : 1);

    const fileLines =
      fileLineContainers[0].getElementsByClassName("js-file-line");

    Array.from(fileLines).forEach((fileLine) => {
      if (!(fileLine instanceof HTMLTableCellElement)) return;
      if (fileLine.classList.contains("colored-indent-line")) return;

      const isPlCElement = !!fileLine.getElementsByClassName("pl-c").length;
      const isPlSElement = !!fileLine.getElementsByClassName("pl-s").length;
      const isCommentLine = isPlCElement || isPlSElement;

      fileLine.classList.add("colored-indent-line");
      fileLine.style.position = "relative";

      const wrapper = document.createElement("span");
      wrapper.style.position = "absolute";
      Array.from(fileLine.childNodes).forEach((element) => {
        wrapper.appendChild(element);
      });
      fileLine.appendChild(wrapper);

      const firstLexeme = wrapper.firstChild;
      if (
        firstLexeme instanceof Text ||
        (isCommentLine && firstLexeme instanceof HTMLSpanElement)
      ) {
        const firstNotIndentCharIndex =
          firstLexeme.textContent.search(/[^\x20\t]/g);

        const numIndentChars =
          firstNotIndentCharIndex !== -1
            ? firstNotIndentCharIndex
            : firstLexeme.textContent.length;

        let numIndentSpaces = 0;
        for (let i = 0; i < numIndentChars; i++) {
          const indentChar = firstLexeme.textContent.charAt(i);
          if (indentChar.match(/[\x200]/g)) {
            numIndentSpaces++;
          } else if (indentChar.match(/[\t]/g)) {
            numIndentSpaces += githubTabSize;
          } else {
            console.warn("indent character isn't space or tab, skipped");
          }
        }

        if (numIndentSpaces === 0) return;

        if (isPlCElement) {
          numIndentSpaces =
            Math.ceil(numIndentSpaces / indentSize) * indentSize;
        }

        if (numIndentSpaces % indentSize === 0) {
          const numIndents = Math.floor(numIndentSpaces / indentSize);

          for (let indentIndex = 0; indentIndex < numIndents; indentIndex++) {
            const coloredIndent = document.createElement("span");
            coloredIndent.innerText = " ".repeat(indentSize);

            const indentColor = colors[indentIndex % colors.length];
            coloredIndent.style.background = indentColor;
            coloredIndent.style.padding = "3px 0 3px 0";
            coloredIndent.style.boxShadow = `1px 0 0 0 ${borderColor} inset`;

            fileLine.appendChild(coloredIndent);
          }
        } else {
          const coloredIndent = document.createElement("span");
          coloredIndent.innerText = " ".repeat(numIndentSpaces);

          coloredIndent.style.background = errorColor;
          coloredIndent.style.padding = "3px 0 3px 0";
          coloredIndent.style.boxShadow = `1px 0 0 0 ${borderColor} inset`;

          fileLine.appendChild(coloredIndent);
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
