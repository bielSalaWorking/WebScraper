const Scraper = require('./Scraper');
(async () => {
    try {
        const scraper = new Scraper('https://www.example.com')
        await scraper.executeScraper();
    } catch (e) {
        console.log(e)
    }
})()
