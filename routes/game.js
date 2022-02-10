var Hash = require('md5')

//cache
const players = {}
const zappyMap = {
    "zade1d": {"name": "common", "value": 1},
    "z48106": {"name": "uncommon", "value": 3},
    "z780cd": {"name": "rare", "value": 5},
    "z412a3": {"name": "legendary", "value": 10},
}
const zappyIds = ["zade1d", "z48106","z780cd","z412a3"]
//


module.exports = app => {
    app.post('/join', join)
    app.get('/stats', stats)
    app.get('/find', find)
    app.post('/catch', get)
    app.get('/top10', top10)
}

const join = (req, res) => {
    const playerName = req.body.name
    const zapposId = req.body.customerId
    const playerId = "p"+Hash(playerName + zapposId).substring(0,10)
    players[playerId] = {"name": playerName, "id": playerId, "startTime": new Date().getTime(), "points": 0, "rank": 99999, "collection": {}}

    const response = players[playerId]

    res.status(200).send(response)
}

const stats = (req, res) => {
    const playerId = req.headers.playerid
    players[playerId].rank = Object.keys(players).sort((a, b) => players[b].points - players[a].points).indexOf(playerId)+1
    const response = players[playerId]
    res.status(200).send(response)
}

const find = (req, res) => {
    const randurl = "zappos.com/" + Hash(Math.random()).substring(0,10)
    const randid = zappyIds[Math.floor(Math.random()*zappyIds.length)];
    const response = {
        "url": randurl,
        "zappyId": randid
    }
    res.status(200).send(response)
}

const get = (req, res) => {
    const playerId = req.headers.playerid
    const zappyId = req.body.zappyId
    const zappyValue = zappyMap[zappyId].value
    const zappyName = zappyMap[zappyId].name

    players[playerId].points += zappyValue
    if (zappyId in players[playerId].collection) players[playerId].collection[zappyId].count++
    else players[playerId].collection[zappyId] = {"name": zappyName, "count": 1}

    const response = {
        "zappyValue": zappyValue,
        "playerPoints": players[playerId].points,
        "playerRank": 99999,
        "collection": players[playerId].collection
    }

    res.status(200).send(response)
}

const top10 = (req, res) => {
    const ranks = Object.keys(players).sort((a, b) => players[b].points - players[a].points).splice(0,10).map(id => { return {"name": players[id].name, "points": players[id].points}})
    res.status(200).send(ranks)
}