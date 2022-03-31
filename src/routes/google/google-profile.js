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

router.post('/', (req, res) => { 
  if (req.body.token == null) return res.status(400).send('Invalid token.')
  oAuth2Client.setCredentials(req.body.token);
  const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client});

  oauth2.userinfo.get((error, response) => {
    if (error) res.status(400).send(error);
    res.send(response.data)
  })
})



export default router;