const Scrapper = require('./Scrapper');
const scrapper = new Scrapper('http://www.canpitero.com');

(async() => {
  const dades = await scrapper.executeScrapper();
  console.log(dades)
})()
