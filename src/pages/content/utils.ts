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
