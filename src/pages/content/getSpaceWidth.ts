import {
  CharWidthRequest,
  CharWidthRequestType,
  readCharWidths,
} from '@pages/content/charWidthReader';

const createRequest = (
  chr: string,
  type: CharWidthRequestType,
  all: CharWidthRequest[]
): CharWidthRequest => {
  const result = new CharWidthRequest(chr, type);
  all.push(result);
  return result;
};

export const getSpaceWidth = (): number => {
  const all: CharWidthRequest[] = [];

  const space = createRequest(' ', CharWidthRequestType.Regular, all);

  readCharWidths(all);

  return space.width;
};
