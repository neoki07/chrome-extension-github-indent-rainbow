export const enum CharCode {
  /**
   * The `\t` character.
   */
  Tab = 9,
  Space = 32,
}

export const getLineCount = (lines: string[]): number => {
  return lines.length;
};

export const getIsContainsMixedTabAndSpaceLine = (line: string): boolean => {
  let tabCount = 0;
  let spaceCount = 0;

  let i = 0;
  const len = line.length;
  while (i < len) {
    const chCode = line.charCodeAt(i);
    if (chCode === CharCode.Space) {
      tabCount++;
    } else if (chCode === CharCode.Tab) {
      spaceCount++;
    } else {
      break;
    }
    i++;
  }

  return tabCount > 0 && spaceCount > 0;
};

export const fetchGithubContent = async (
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
