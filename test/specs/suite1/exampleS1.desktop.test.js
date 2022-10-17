describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        await browser.url("https://www.google.com");
        await browser.pause(1000);
    });
});


