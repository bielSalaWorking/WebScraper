const axios = require('axios');
const fs = require('fs')
const {JSDOM} = require('jsdom');

class Scrapper {

  static dangerDomains = ['loan','work','biz','racing','ooo','life','ltd','png'];
  static emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  static domObject = null;
  static internalLinks = new Set();
  static externalLinks = new Set();

  constructor(url){
    this.url = url;
    this.emails = new Set();
    this.dangerEmails = new Set();
  }
  async executeScrapper() {

      const fetchedData = await this.fetchUrlAndGetDom(this.url);
      const links = await this.getInternalLinks();

      const linksArray = Array.from(Scrapper.internalLinks);

      await this.fetchInternalLinks(linksArray)
  }
  async fetchInternalLinks(internalLink){

    const result = await Promise.all(internalLink.map((link) => {
         return this.fetchUrlAndGetDom(`${this.url}${link}`);
    }));

    let newResult = Array.from(result);
    newResult.filter(el => el);
    this.addEmails(newResult);

  }
  async fetchUrlAndGetDom(url){
    try {
      const response = await axios(url);
      if(response.status === 200) {
        let htmlData = await response.data;
        Scrapper.domObject = await new JSDOM(htmlData);
        let dades = this.searchForEmails();

        return dades;
      }
      else if(response.status === 404) {
        console.log('this page doesnt exists')
        return process.exit(1);
      }
    } catch (error) {
        console.log(error)
        return process.exit(1);
    }
   }
  getInternalLinks(){
    let links = Scrapper.domObject.window.document.body;
    links = links.querySelectorAll('a[href^="/"]');
    Array
      .from(links)
      .filter(link => Scrapper.internalLinks.add(link.getAttribute('href')));
  }
  getExternalLinks(){
    let links = Scrapper.domObject.window.document.body;
    links = links.querySelectorAll('a[href^="http"]');
    Array
      .from(links)
      .filter(link => Scrapper.externalLinks.add(link.getAttribute('href')));
  }

 searchForEmails(){
   let emailsInDom = Scrapper.domObject.window.document.body.innerHTML;
   let emails = emailsInDom
                 .toString()
                 .match(Scrapper.emailRegex)
   return emails;

  }
 validateEmails(){
    const validatedEmails = Array
                        .from(this.emails)
                        .filter(email => {
       let domainName = email
                        .split('@')[1]
                        .split('.')[1];
       if(Scrapper.dangerDomains.includes(domainName)){
         this.dangerEmails.add(email);
         this.emails.delete(email);
       }
       else return email;
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
  }
}
module.exports = Scrapper;
