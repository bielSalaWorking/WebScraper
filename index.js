const Scrapper = require('./Scrapper');
const scrapper = new Scrapper('https://www.k8oms.net/links/mailto-link');
console.log(process.argv);

(async () => {
  try {
    const dades = await scrapper.executeScrapper();

  } catch (e) {
    console.log(e)
  }
})()

//'https://www.k8oms.net/links/mailto-link'
