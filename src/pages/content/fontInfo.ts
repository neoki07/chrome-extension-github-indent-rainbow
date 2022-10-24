export type FontInfo = {
  fontFamily: string;
  fontSize: string;
};

export const githubFontInfoMock: FontInfo = {
  fontFamily:
    'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
  fontSize: '12px',
};

export const applyFontInfo = (domNode: HTMLElement): void => {
  domNode.style.fontFamily = githubFontInfoMock.fontFamily; // TODO: get from GitHub DOM
  domNode.style.fontSize = githubFontInfoMock.fontSize; // TODO: get from GitHub DOM
};
