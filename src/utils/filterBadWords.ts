import { Filter } from "bad-words";

export const filterBadWords = (text: string): string => {
    const filter = new Filter();
    return filter.clean(text);
}

