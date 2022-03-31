import express from 'express';
import authenticationRoutes from './google-authentication.js'
import driveRoutes from './google-drive.js'
import profileRoutes from './google-profile.js'

const router = express.Router()

router.use('/auth', authenticationRoutes)
router.use('/profile', profileRoutes)
router.use('/drive', driveRoutes)

export default router;
