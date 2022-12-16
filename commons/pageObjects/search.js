export default class SearchPage {
    static async doSearchStuff() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('base search page actions');
            }, 2000)
        });
    };
    static returnSearchStuff() {
        return "Base search page"
    };
};
