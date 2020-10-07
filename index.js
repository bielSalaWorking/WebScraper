const Scrapper = require('./Scrapper');
const scrapper = new Scrapper('https://www.k8oms.net');

(async () => {
  try {
    const dades = await scrapper.executeScrapper();

  } catch (e) {
    console.log(e)
  }
})()
