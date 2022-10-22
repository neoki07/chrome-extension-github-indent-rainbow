import detectIndent from 'detect-indent';

const colors = [
  'rgba(255,255,64,0.07)',
  'rgba(127,255,127,0.07)',
  'rgba(255,127,255,0.07)',
  'rgba(79,236,236,0.07)',
];

const errorColor = 'rgba(128,32,32,0.6)';
const tabmixColor = 'rgba(128,32,96,0.6)';
const borderColor = 'rgba(255,255,255,0.1)';

const spaceWidth = 7.25; // TODO: compute from font used
const lineHeight = 20; // TODO: compute from GitHub DOM

const root = document.createElement('div');
root.id = 'github-indent-rainbow-content-view-root';
document.body.prepend(root);

const enum CharCode {
  /**
   * The `\t` character.
   */
  Tab = 9,
  Space = 32,
}

export class IndentGuideHorizontalLine {
  constructor(
    public readonly top: boolean,
    public readonly endColumn: number
  ) {}
}

export class IndentGuide {
  constructor(
    public readonly visibleColumn: number | -1,
    public readonly column: number | -1,
    public readonly className: string,
    /**
     * If set, this indent guide is a horizontal guide (no vertical part).
     * It starts at visibleColumn and continues until endColumn.
     */
    public readonly horizontalLine: IndentGuideHorizontalLine | null,
    /**
     * If set (!= -1), only show this guide for wrapped lines that don't contain this model column, but are after it.
     */
    public readonly forWrappedLinesAfterColumn: number | -1,
    public readonly forWrappedLinesBeforeOrAtColumn: number | -1
  ) {
    if ((visibleColumn !== -1) === (column !== -1)) {
      throw new Error();
    }
  }
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
  aboveContentLineIndent: number,
  belowContentLineIndent: number
): number => {
  if (aboveContentLineIndent === -1 || belowContentLineIndent === -1) {
    // At the top or bottom of the file
    return 0;
  } else if (aboveContentLineIndent < belowContentLineIndent) {
    // we are inside the region above
    return aboveContentLineIndent;
  } else if (aboveContentLineIndent === belowContentLineIndent) {
    // we are in between two regions
    return belowContentLineIndent;
  } else {
    // we are inside the region that ends below
    return belowContentLineIndent;
  }
};

const getLinesIndentLevels = (
  lines: string[],
  indentSize: number,
  tabSize: number
) => {
  const lineCount = getLineCount(lines);

  const result: number[] = new Array<number>(lineCount);

  let aboveContentLineIndex =
    -2; /* -2 is a marker for not having computed it */
  let aboveContentLineIndent = -1;

  let belowContentLineIndex =
    -2; /* -2 is a marker for not having computed it */
  let belowContentLineIndent = -1;

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const line = lines[lineNumber - 1];

    const resultIndex = lineNumber - 1;

    const currentIndent = computeIndentLevel(line, tabSize);
    if (currentIndent >= 0) {
      // This line has content (besides whitespace)
      // Use the line's indent
      aboveContentLineIndex = lineNumber - 1;
      aboveContentLineIndent = currentIndent;
      result[resultIndex] = currentIndent;

      continue;
    }

    if (aboveContentLineIndex === -2) {
      aboveContentLineIndex = -1;
      aboveContentLineIndent = -1;

      // must find previous line with content
      for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
        const indent = computeIndentLevel(lines[lineIndex], tabSize);
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
        const indent = computeIndentLevel(lines[lineIndex], tabSize);
        if (indent >= 0) {
          belowContentLineIndex = lineIndex;
          belowContentLineIndent = indent;
          break;
        }
      }
    }

    result[resultIndex] = getIndentLevelForWhitespaceLine(
      aboveContentLineIndent,
      belowContentLineIndent
    );
  }

  return result;
};

const renderIndentGuides = (
  fileBlobContainerElement: HTMLElement,
  fileLineContainerElement: HTMLElement,
  lines: string[],
  indentSize: number,
  tabSize: number
): void => {
  const lineCount = getLineCount(lines);
  const height = lineCount * lineHeight;

  const linesContentContainerElement = document.createElement('div');
  linesContentContainerElement.className = 'lines-content';
  linesContentContainerElement.style.position = 'relative';
  linesContentContainerElement.style.width = '100%';
  linesContentContainerElement.style.height = `${height}px`;
  linesContentContainerElement.style.overflow = 'hidden';

  const viewOverlayContainerElement = document.createElement('div');
  viewOverlayContainerElement.className = 'view-overlays';
  viewOverlayContainerElement.style.position = 'absolute';
  viewOverlayContainerElement.style.top = '0px';
  viewOverlayContainerElement.style.width = '5000px';
  viewOverlayContainerElement.style.height = '0px';

  const indentGuides = getLinesIndentLevels(lines, indentSize, tabSize);
  const isCommentLines = getIsCommentLines(fileBlobContainerElement);

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const lineElement = document.createElement('div');
    lineElement.style.position = 'absolute';
    lineElement.style.left = '0px';
    lineElement.style.top = `${lineHeight * (lineNumber - 1)}px`;
    lineElement.style.width = '100%';
    lineElement.style.height = `${lineHeight}px`;

    const lineIndex = lineNumber - 1;
    const indent = indentGuides[lineIndex];
    const indentLevelsInLine = Math.ceil(indent / indentSize);
    const leftOffset = 60; // TODO: compute line number content width;

    for (let indentLvl = 1; indentLvl <= indentLevelsInLine; indentLvl++) {
      const indentGuide = (indentLvl - 1) * indentSize + 1;

      const left = leftOffset + (indentGuide - 1) * spaceWidth;
      const width = spaceWidth;

      const verticalLineIndentGuideElement = document.createElement('div');
      verticalLineIndentGuideElement.classList.add(
        'core-guide',
        'core-guide-indent',
        'vertical'
      );
      verticalLineIndentGuideElement.style.position = 'absolute';
      verticalLineIndentGuideElement.style.left = `${left}px`;
      verticalLineIndentGuideElement.style.height = `${lineHeight}px`;
      verticalLineIndentGuideElement.style.width = `${width}px`;
      verticalLineIndentGuideElement.style.boxShadow = `1px 0 0 0 ${borderColor} inset`;
      lineElement.appendChild(verticalLineIndentGuideElement);

      if (
        !lines[lineIndex].length ||
        (!isCommentLines[lineIndex] && indent % indentSize !== 0)
      ) {
        continue;
      }

      const coloredIndentGuideElement = document.createElement('div');
      coloredIndentGuideElement.classList.add(
        'core-guide',
        'core-guide-indent',
        'colored'
      );
      coloredIndentGuideElement.style.position = 'absolute';
      coloredIndentGuideElement.style.left = `${left}px`;
      coloredIndentGuideElement.style.height = `${lineHeight}px`;
      coloredIndentGuideElement.style.width = `${width * indentSize}px`;
      const indentColor = colors[indentLvl % colors.length];
      coloredIndentGuideElement.style.background = indentColor;
      lineElement.appendChild(coloredIndentGuideElement);
    }

    if (!isCommentLines[lineIndex] && indent % indentSize !== 0) {
      const left = leftOffset;
      const width = spaceWidth * indent;

      const coloredIndentGuideElement = document.createElement('div');
      coloredIndentGuideElement.classList.add(
        'core-guide',
        'core-guide-indent',
        'colored'
      );
      coloredIndentGuideElement.style.position = 'absolute';
      coloredIndentGuideElement.style.left = `${left}px`;
      coloredIndentGuideElement.style.height = `${lineHeight}px`;
      coloredIndentGuideElement.style.width = `${width}px`;
      coloredIndentGuideElement.style.background = errorColor;
      lineElement.appendChild(coloredIndentGuideElement);
    }

    viewOverlayContainerElement.appendChild(lineElement);
  }

  const viewLinesContainerElement = document.createElement('div');
  viewLinesContainerElement.className = 'view-lines';
  viewLinesContainerElement.style.position = 'absolute';
  viewLinesContainerElement.appendChild(fileLineContainerElement);

  linesContentContainerElement.append(
    viewOverlayContainerElement,
    viewLinesContainerElement
  );

  fileBlobContainerElement.append(linesContentContainerElement);
};

const getIsCommentLines = (
  fileBlobContainerElement: HTMLElement
): boolean[] => {
  const fileLineElements =
    fileBlobContainerElement.getElementsByClassName('js-file-line');

  return Array.from(fileLineElements).map((fileLineElement) => {
    const firstLexemeNode = fileLineElement.firstChild;

    return (
      firstLexemeNode instanceof HTMLSpanElement &&
      firstLexemeNode.className === 'pl-c'
    );
  });
};

const fetchGithubContent = async (
  repo: string,
  branch: string,
  path: string
): Promise<string> => {
  const uri = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;

  return await fetch(encodeURI(uri)).then((response) => {
    if (!response.ok) throw Error(`Failed to fetch content from ${uri}`);
    return response.text();
  });
};

const onUpdate = async () => {
  const fileBlobContainerElements = document.getElementsByClassName(
    'js-blob-code-container'
  );

  if (!fileBlobContainerElements.length) return;
  const fileBlobContainerElement = fileBlobContainerElements[0];
  if (!(fileBlobContainerElement instanceof HTMLElement)) return;

  if (fileBlobContainerElement.classList.contains('rendered-indent-guide'))
    return;
  fileBlobContainerElement.classList.add('rendered-indent-guide');

  const fileLineContainerElements =
    fileBlobContainerElement.getElementsByClassName('js-file-line-container');

  if (!fileBlobContainerElements.length) {
    console.error(
      'Not found HTML element with class name `js-file-line-container`'
    );
    return;
  }

  const fileLineContainerElement = fileLineContainerElements[0];
  if (!(fileLineContainerElement instanceof HTMLElement)) return;

  const url = location.href;
  const splitUrl = url.split('/');
  const repo = `${splitUrl[3]}/${splitUrl[4]}`;
  const branch = splitUrl[6];
  const path = splitUrl.slice(7).join('/');
  const content = await fetchGithubContent(repo, branch, path).catch(
    (err: Error) => {
      throw Error(err.message);
    }
  );

  const lines = content.split(/\r\n|\r|\n/);

  const dataTabSizeAttribute =
    fileLineContainerElement.getAttribute('data-tab-size');

  if (!dataTabSizeAttribute) {
    console.error('Could not get tab size');
    return;
  }

  const tabSize = Number(dataTabSizeAttribute);

  const indent = detectIndent(content);
  const indentType = indent.type;
  const indentSize = indent.amount * (indentType === 'tab' ? tabSize : 1);

  renderIndentGuides(
    fileBlobContainerElement,
    fileLineContainerElement,
    lines,
    indentSize,
    tabSize
  );
};

const urlChangeObserver = new MutationObserver(() => {
  console.log('DOM changed!');
  urlChangeObserver.disconnect();
  onUpdate();
  urlChangeObserver.observe(document, { childList: true, subtree: true });
});

onUpdate();
urlChangeObserver.observe(document, { childList: true, subtree: true });
