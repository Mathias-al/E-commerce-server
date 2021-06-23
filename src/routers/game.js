const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const GameControl = require('../controller/game')

router.post('/create_game',auth, GameControl.createGame)
router.get('/games/all', GameControl.getAllGames)
router.post('/game/detail', GameControl.gameDetail)
router.post('/game/addToCart',auth, GameControl.addToCart)
router.delete('/game/removeFromCart',auth, GameControl.removeGame)
router.post('/game/addToFav',auth, GameControl.addToFav)
router.delete('/game/removeFromFav',auth, GameControl.removeFav)


module.exports = router