const Scraper = require('./Scraper');
(async () => {
  try {
    const scraper = new Scraper('https://www.k8oms.net')

   await scraper.executeScraper();
  } catch (e) {
    console.log(e)
  }
})()
