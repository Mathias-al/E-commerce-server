const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const GameControl = require('../controller/game')

router.post('/create_game', GameControl.createGame)


module.exports = router