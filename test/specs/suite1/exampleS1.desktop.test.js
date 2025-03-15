describe('Showcase isClickable() bug', () => {
    it('should show the bug', async () => {
        const openJsFooterLogo = await $('//*[@alt="OpenJS Foundation Logo"]');
        const getPageScroll = () => browser.execute(() => ({
            x: window.scrollX,
            y: window.scrollY,
        }));
        await browser.url("https://webdriver.io/docs/gettingstarted/");
        await browser.pause(2000);
        console.log("Initial page scroll coordinates:", await getPageScroll());
        await openJsFooterLogo.isClickable();
        console.log("Page scrool coordinates after isClickable check:", await getPageScroll());
        await browser.pause(5000);
    });
});


