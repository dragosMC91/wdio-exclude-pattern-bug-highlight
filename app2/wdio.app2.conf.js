import merge from 'deepmerge';
import {config as baseConfig} from '../wdio.conf.js';
import { settings } from '#app/settings';

export const config = merge.all([
    baseConfig,
    {
        before: async function(caps, specs, browser) {
            browser.custom = `${settings.appName} wdio conf`
        },
    }
])