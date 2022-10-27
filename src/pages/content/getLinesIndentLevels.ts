import { CharCode, getLineCount } from '@pages/content/utils';

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

export const getLinesIndentLevels = (lines: string[], tabSize: number) => {
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
