import { existsSync } from 'fs';
import { resolve } from 'path';

export const resolvePageObject = name => {
    return existsSync(resolve(__dirname, `test/pageObjects/${name}`));
}