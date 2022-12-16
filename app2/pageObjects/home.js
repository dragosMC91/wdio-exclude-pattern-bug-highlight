import BaseHomePage from 'commons/pageObjects/home.js';
import { settings } from '#app/settings';

export default class HomePage extends BaseHomePage{
    static async doStuff() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(`${settings.appName} home page actions`);
            }, 2000)
        });
    };

    static returnStuff() {
        return `${settings.appName} home page`
    };
};
