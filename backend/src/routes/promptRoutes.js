const express = require('express')
const router = express.Router()
const c = require('../controllers/promptController')

router.get('/categories', c.listCategories)  // must be before /:id
router.get('/',           c.listPrompts)
router.get('/:id',        c.getPrompt)
router.post('/',          c.createPrompt)
router.put('/:id',        c.updatePrompt)
router.delete('/:id',     c.deletePrompt)

module.exports = router
