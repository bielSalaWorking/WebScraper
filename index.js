const axios = require('axios');
const fs = require('fs')
const {JSDOM} = require('jsdom');

let emails = new Set();
const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
const url = 'yourURL';


const fetchUrl = async () => {
  try {
    const response = await axios(url);
    const html = await response.data;
    const domData = new JSDOM(html);

    const emailsInDom = searchForEmails(domData)
    addEmails(emailsInDom, emails)
    await writeFile();

  } catch (error) {
    console.log(error)
  }
}
const searchForEmails = (domData) => {
  let emails = domData.window.document.body.innerHTML;
  return emails
    .toString()
    .match(emailRegex);
}
const addEmails = (emailsInDom,emails) => {
  emailsInDom.filter(el => emails.add(el))
  return emails;
}
const writeFile = () => {
  return new Promise((resolve, reject) => {
    fs.writeFile('./emails.txt', Array.from(emails), err => {
      if (err) reject('Could not write file');
      resolve('success');
    });
  });
}

fetchUrl()
