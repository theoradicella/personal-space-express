import express from 'express';
import { google } from 'googleapis'
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const credentials = require('../../../credentials.json')

const clientId = credentials.web.client_id;
const clienSecret = credentials.web.client_secret;
const redirectUris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(clientId,clienSecret,redirectUris[0]);
const SCOPE= ['https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile ']

const router = express.Router()

// GENERATES THE URL TO AUTHENTICATE & AUTHORIZE ACCESS TO THE SCOPES WITH GOOGLE
router.get('/', (req, res) => { 
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPE,
  })
  res.send(authUrl)
})

// REQUEST THE TOKEN TO ACCESS GOOGLE APIS (code from the authUrl needs to be sent)
router.post('/', (req, res) => {
  if (req.body.code == null) return res.status(400).send('Invalid Request.')
  oAuth2Client.getToken(decodeURIComponent(req.body.code), (error, token) => {
    if (error) {
      console.error('Error retrieving access token: ', error)
      return res.status(400).send('Error retrieving access token.')
    }
    res.send(token);
  })
})

export default router;