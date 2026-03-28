const express = require('express')
const router = express.Router()
const challengeController = require('../controllers/challengeController')
const upload = require('../middleware/upload')

router.post('/', challengeController.createChallenge)
router.post('/:code/join', challengeController.joinChallenge)
router.post('/:code/upload', upload.single('design'), challengeController.uploadDesign)
router.post('/:code/vote', challengeController.submitVote)
router.get('/:code/results', challengeController.getResults)
router.get('/submissions/:id', challengeController.serveSubmission)

module.exports = router
