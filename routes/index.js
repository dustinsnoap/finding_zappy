const game = require('./game')

module.exports = app => {
    app.get('/ping', ping)
    game(app)
}

const ping = (req, res) => {
    res.status(200).send("hey there!")
}