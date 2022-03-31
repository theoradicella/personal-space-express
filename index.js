import express from 'express';
import cors from 'cors'

const app = express();
const PORT = 3001;

// ROUTES IMPORTS
import googleRoutes from './src/routes/google/index.js'

// MIDLEWARES
app.use(cors({ origin: true, credentials: true }))
app.use(express.json()) // It parses incoming requests with JSON payloads and is based on body-parser.

// ROUTES
app.use('/google', googleRoutes)

app.listen(PORT, () => console.log('Express server listening on port ' + PORT))