const Game = require('../models/game')

class GameControl {
    async createGame(req, res) {
        const game = new Game(req.body)
        try {
           await game.save()
           res.status(201).send({
               msg:'success'
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
}
module.exports = new GameControl()