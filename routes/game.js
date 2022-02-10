var Hash = require('md5')

//cache
const players = {}
const customerPlayerMap = {}
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
    app.post('/addZappy', addZappy)
    app.post('/addManyZappys', addManyZappys)
    app.get('/getAllZappys', getAllZappys)
    app.get('/user', user)
}

const user = (req, res) => {
    const customerId = req.headers.customerid
    if(customerId in customerPlayerMap) {
        const playerId = customerPlayerMap[customerId]
        players[playerId].rank = Object.keys(players).sort((a, b) => players[b].points - players[a].points).indexOf(playerId)+1
        const response = players[playerId]
        res.status(200).send(response)
        return
    }
    res.status(646).send("customerId not recgonized")
}

const join = (req, res) => {
    const playerName = req.body.name
    const zapposId = req.body.customerId
    const playerId = "p"+Hash(playerName + zapposId).substring(0,10)
    if(playerId in players) {
        res.status(677).send("Player name already in use")
        return
    }
    players[playerId] = {"name": playerName, "id": playerId, "startTime": new Date().getTime(), "points": 0, "rank": 99999, "collection": {}}
    customerPlayerMap[zapposId] = playerId

    const response = players[playerId]

    res.status(200).send(response)
}

const stats = (req, res) => {
    const playerId = req.headers.playerid
    players[playerId].rank = Object.keys(players).sort((a, b) => players[b].points - players[a].points).indexOf(playerId)+1
    if(playerId in players) {
        const response = players[playerId]
        res.status(200).send(response)
        return
    }
    res.status(646).send("playerId not found")
}

const find = (req, res) => {
    const randurl = "zappos.com/" + Hash(Math.random()).substring(0,10)
    const randid = zappyIds[Math.floor(Math.random()*zappyIds.length)]
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
        "playerRank": Object.keys(players).sort((a, b) => players[b].points - players[a].points).indexOf(playerId)+1,
        "collection": players[playerId].collection
    }

    res.status(200).send(response)
}

const top10 = (req, res) => {
    const ranks = Object.keys(players).sort((a, b) => players[b].points - players[a].points).splice(0,10).map(id => { return {"id": id, "name": players[id].name, "points": players[id].points}})
    res.status(200).send(ranks)
}

const addZappy = (req, res) => {
    const zappyName = req.body.name
    const zappyImgUrl = req.body.imgUrl
    const zappyValue = req.body.value
    const zappyId = req.body.zappyId ? req.body.zappyId : "z" + Hash(zappyName + zappyImgUrl + zappyValue).substring(0,9)
    if(zappyId in zappyMap) {res.status(648).send(`We have enough ${zappyName}'s`); return}
    zappyIds.push(zappyId)
    zappyMap[zappyId] = {"name": zappyName, "imgUrl": zappyImgUrl, "value": zappyValue}
    const response = {"id": zappyId, "name": zappyName, "imgUrl": zappyImgUrl, "value": zappyValue}
    res.status(200).send(response)
}

const addManyZappys = (req, res) => {
    let newZappys = req.body
    newZappys = newZappys.filter(zappy => {
        const id = "z" + Hash(zappy.name + zappy.imgUrl + zappy.value).substring(0,9)
        if (id in zappyMap) return false
        return true
    })
    newZappys.map(zappy => {
        console.log(zappy.name)
        const id = "z" + Hash(zappy.name + zappy.imgUrl + zappy.value).substring(0,9)
        zappyIds.push(id)
        zappyMap[id] = {"name": zappy.name, "imgUrl": zappy.imgUrl, "value": zappy.value}
        zappy.id = id
        return zappy
    })
    if(!newZappys.length) {res.status(666).send("Nothing added; find better llamas"); return}
    res.status(200).send(newZappys)
}

const getAllZappys = (req, res) => {
    res.status(200).send(zappyMap)
}