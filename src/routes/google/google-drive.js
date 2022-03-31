import express from 'express';
import { google } from 'googleapis'
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const credentials = require('../../../credentials.json')

const clientId = credentials.web.client_id;
const clienSecret = credentials.web.client_secret;
const redirectUris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(clientId,clienSecret,redirectUris[0]);

const router = express.Router()

// TO SEE ALL FILES INSIDE APPDATA FOLDER
router.post('/list-files', async (req,res) => {
  if (req.body.token == null) return res.status(400).send('Invalid token.')
  const currentYear = new Date().getFullYear()
  oAuth2Client.setCredentials(req.body.token);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client});

  const folderSearch = await drive.files.list({
    q: `name='personal-finance-${currentYear}' and trashed=false`
  })

  const response = await drive.files.list({
    q: `'${folderSearch.data.files[0].id}' in parents and trashed=false`
  })
  res.send(response.data.files)
})

// TO DELETE A FILE FROM DRIVE WITH ID
router.delete('/delete-file/:fileId', async (req,res) => {
  if (req.body.token == null) return res.status(400).send('Invalid token.')

  oAuth2Client.setCredentials(req.body.token);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client});

  try {
    const fileDeletion = await drive.files.delete({
      'fileId': req.params.fileId,
    })
    res.send(fileDeletion)
  } catch (response) {
    res.status(404).send(response.errors[0].message)
  }

})

// !!! TO DELETE ALL FILES FROM APPDATA FOLDER! (BE CAREFUL!)
router.delete('/delete-all-files', async (req,res) => {
  if (req.body.token == null) return res.status(400).send('Invalid token.')

  oAuth2Client.setCredentials(req.body.token);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client});

  const response = await drive.files.list({
  })

  for (let i = 0; i < response.data.files.length; i++) {
    await drive.files.delete({
      'fileId': response.data.files[i].id,
    })
  }
  res.send('All files deleted.')

})

// TO CREATE A SPREADSHEET FROM CURRENT MONTH INSIDE A CURRENT YEAR FOLDER INSIDE AN APP FOLDER
router.post('/create-spreadsheet', async (req, res) => { 
  if (req.body.token == null) return res.status(400).send('Invalid token.')
  
  oAuth2Client.setCredentials(req.body.token);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client});
  
  // GET CURRENT DATES AND INITIALIZE FOLDER
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  let folderId;

  // CHECKING IF FODLER WAS ALREADY CREATED
  const folderSearch = await drive.files.list({
    q: `name='personal-finance-${currentYear}' and trashed=false`,
  })
  if(folderSearch.data.files.length) {
    // IF FOLDER IS ALREADY CREATED
    folderId = folderSearch.data.files[0].id
  }
  else {
    // IF FOLDER WAS NOT CREATED, CREATES ONE
    const fileMetadata = {
      'name': `personal-finance-${currentYear}`,
      'mimeType': 'application/vnd.google-apps.folder'
    };
    const folderCreation = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    })

    folderId = folderCreation.data.id
  }


    // CHECKING IF SPREADSHEET FOR THE MONTH INSIDE THE FOLDER EXISTS
  const spreadsheetSearch = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.spreadsheet' and '${folderId}' in parents and name='${currentMonth}' and trashed=false`,
  })

  if(spreadsheetSearch.data.files.length) {
    // IF SPREADSHEET IS ALREADY CREATED DO NOTHING
    res.send('Spreadsheet for the current month already created.')
  }
  else {
    // IF SPREADSHEET WAS NOT CREATED, CREATES ONE INSIDE THE FOLDER
    var fileMetadata = {
      'name': currentMonth,
      'parents': [folderId],
      'mimeType': 'application/vnd.google-apps.spreadsheet'
    };

    //(Need to copy from model)
    const spreadsheetCreation = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    })
    res.send(spreadsheetCreation)
  }
})



export default router;