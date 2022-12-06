export default class HomePage {
    static async doStuff() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('stuff done');
            }, 2000)
        });
    };

    static async returnStuff() {
        return "A coconut"
    };
};
