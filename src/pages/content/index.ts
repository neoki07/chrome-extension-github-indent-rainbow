import detectIndent from 'detect-indent';
import { getSpaceWidth } from '@pages/content/getSpaceWidth';
import { getLinesIndentLevels } from '@pages/content/getLinesIndentLevels';
import {
  fetchGithubContent,
  getIsContainsMixedTabAndSpaceLine,
  getLineCount,
} from '@pages/content/utils';

const colors = [
  'rgba(255,255,64,0.07)',
  'rgba(127,255,127,0.07)',
  'rgba(255,127,255,0.07)',
  'rgba(79,236,236,0.07)',
];

const errorColor = 'rgba(128,32,32,0.6)';
const tabmixColor = 'rgba(128,32,96,0.6)';
const borderColor = 'rgba(255,255,255,0.1)';

const spaceWidth = getSpaceWidth();

const getLeftOffset = (fileLineContainerElement: HTMLElement): number => {
  const lineNumberElements =
    fileLineContainerElement.getElementsByClassName('js-line-number');
  const codeElements =
    fileLineContainerElement.getElementsByClassName('js-file-line');

  if (
    !lineNumberElements.length ||
    !codeElements.length ||
    !(lineNumberElements[0] instanceof HTMLElement) ||
    !(codeElements[0] instanceof HTMLElement)
  ) {
    console.warn('Not found line number or code element');
    return 0;
  }

  const lineNumberWidth = lineNumberElements[0].offsetWidth;
  const codePaddingLeft =
    parseInt(getComputedStyle(codeElements[0]).paddingLeft) || 0;

  return lineNumberWidth + codePaddingLeft;
};

const getLineHeight = (fileLineContainerElement: HTMLElement): number => {
  const lineNumberElements =
    fileLineContainerElement.getElementsByClassName('js-line-number');

  if (
    !lineNumberElements.length ||
    !(lineNumberElements[0] instanceof HTMLElement)
  ) {
    console.warn('Not found line number element');
    return 0;
  }

  return lineNumberElements[0].offsetHeight;
};

const getIsCommentLines = (
  fileBlobContainerElement: HTMLElement
): boolean[] => {
  const fileLineElements =
    fileBlobContainerElement.getElementsByClassName('js-file-line');

  return Array.from(fileLineElements).map((fileLineElement) => {
    const spanElements = fileLineElement.getElementsByTagName('span');
    return spanElements.length && spanElements[0].className === 'pl-c';
  });
};

const renderIndentGuides = (
  fileBlobContainerElement: HTMLElement,
  fileLineContainerElement: HTMLElement,
  lines: string[],
  indentSize: number,
  tabSize: number
): void => {
  const indentGuides = getLinesIndentLevels(lines, tabSize);
  const isCommentLines = getIsCommentLines(fileBlobContainerElement);
  const leftOffset = getLeftOffset(fileLineContainerElement);
  const lineHeight = getLineHeight(fileLineContainerElement);
  const lineCount = getLineCount(lines);

  const viewOverlayContainerElement = document.createElement('div');
  viewOverlayContainerElement.className = 'view-overlays';

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
    const isIncorrectIndentLine = indent % indentSize !== 0;

    const isContainsMixedTabAndSpaceLine = getIsContainsMixedTabAndSpaceLine(
      lines[lineIndex]
    );

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
        (!isCommentLines[lineIndex] &&
          (isIncorrectIndentLine || isContainsMixedTabAndSpaceLine))
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
      coloredIndentGuideElement.style.background =
        colors[indentLvl % colors.length];
      lineElement.appendChild(coloredIndentGuideElement);
    }

    if (
      !isCommentLines[lineIndex] &&
      (isIncorrectIndentLine || isContainsMixedTabAndSpaceLine)
    ) {
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
      coloredIndentGuideElement.style.background = isIncorrectIndentLine
        ? errorColor
        : tabmixColor;
      lineElement.appendChild(coloredIndentGuideElement);
    }

    viewOverlayContainerElement.appendChild(lineElement);
  }

  fileBlobContainerElement.style.position = 'relative';
  fileBlobContainerElement.prepend(viewOverlayContainerElement);
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

  if (splitUrl.length < 8) {
    console.error('Current URL format is incorrect');
    return;
  }

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
