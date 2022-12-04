const hardClickElement = async element => {
    await element.waitForDisplayed();
    await browser.execute(webElement => {
        webElement.click();
    }, element);
};

describe('Mobile SMS ovation stats - Detail page - Map view slidein', () => {
    it(`should click SMS button in map view slidein`, async () => {
        const viewOnMapBtn = $('//img[contains(@alt, "Society map")]');
        const slideInSMSBtn = $('//*[@aria-label="Slidein popup Society Map"]//*[@aria-label="SMS"]');

        await browser.url('https://www.zameen.com/Property/buner_alpha_town_brand_new_house_for_sale-12214389-12879-1.html')
        await browser.setupInterceptor();
        await hardClickElement(await viewOnMapBtn);
        await hardClickElement(await slideInSMSBtn);
        await browser.pause(2000);
        await browser.getRequests()
    });
});