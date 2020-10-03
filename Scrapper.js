const axios = require('axios');
const fs = require('fs')
const {JSDOM} = require('jsdom');

class Scrapper {
  static dangerDomains = ['loan','work','biz','racing','ooo','life','ltd'];
  static emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi

  constructor(url){
    this.url = url;
    this.emails = new Set();
    this.dangerEmails = new Set();
  }
  async executeScrapper() {

      const fetchedData = await this.fetchUrl();
      const emailsInDom = this.searchForEmails(fetchedData);
      this.addEmails(emailsInDom);
      const writeFile = await this.writeFile()
      return this.emails
  }
  async fetchUrl(){
    try {
      const response = await axios(this.url);
      if(response.status === 200) {
        const htmlData = await response.data;

        return htmlData;
      }
    } catch (error) {
      console.log(error)
    }
  }
   searchForEmails(htmlData){
    const domData = new JSDOM(htmlData);
    let emails = domData.window.document.body.innerHTML;
    return emails
      .toString()
      .match(Scrapper.emailRegex);
  }
   validateEmails(){
     const validatedEmails = this.emails.filter(el => {
        let domainName = el.split('@')[1].split('.')[1];
        if(Scrapper.dangerDomains.includes(domainName)){
          this.dangerEmails.add(el);
          this.emails.delete(el);
        }
        else return el;
    });
  }
  async writeFile(){
    return new Promise((resolve, reject) => {
      fs.writeFile('./emails.txt', Array.from(this.emails), err => {
        if (err) reject('Could not write file');
        resolve('success');
      });
    });
  }
   addEmails(emailsInDom){
    emailsInDom.filter(el => this.emails.add(el))
    return this.emails;
  }
}
module.exports = Scrapper;
