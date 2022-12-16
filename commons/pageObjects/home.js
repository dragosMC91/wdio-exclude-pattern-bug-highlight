import { settings } from '#app/settings';

export default class HomePage {
    static async doStuff() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('base home page actions');
            }, 2000)
        });
    };

    static returnStuff() {
        return "Base home page"
    };
};
