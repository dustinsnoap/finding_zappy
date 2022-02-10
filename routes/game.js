var Hash = require('md5')

//cache
const players = {}
const customerPlayerMap = {}
const zappyMap = {
    // "zade1d": {"name": "common", "value": 1},
    // "z48106": {"name": "uncommon", "value": 3},
    // "z780cd": {"name": "rare", "value": 5},
    // "z412a3": {"name": "legendary", "value": 10},
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
    app.post('/removePlayer', removePlayer)
}

const removePlayer = (req, res) => {
    const playerId = req.body.playerId
    const zapposId = req.headers.customerid ? req.headers.customerid : req.body.customerId
    if(playerId in players) {
        const custId = Object.keys(customerPlayerMap).find(key => customerPlayerMap[key] === playerId)
        delete customerPlayerMap[custId]
        delete players[playerId]
        res.status(200).send(`Player ${playerId} has been removed`)
        return
    }
    else if (zapposId in customerPlayerMap) {
        const id = customerPlayerMap[zapposId]
        delete customerPlayerMap[zapposId]
        delete players[id]
        res.status(200).send(`Player ${id} has been removed`)
        return
    }
    res.status(777).send("Player not found; include playerId or customerId in body")
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
    if(!playerName) {
        res.status(678).send("name field is required in body")
        return
    }
    const zapposId = req.headers.customerid ? req.headers.customerid : req.body.customerId
    if(!zapposId) {
        res.status(677).send("customerId field is required in header")
        return
    }
    const playerId = "p"+Hash(playerName + zapposId).substring(0,10)
    if(playerId in players) {
        res.status(679).send("Player name already in use")
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
    const playerId = req.headers.playerid ? req.headers.playerid : req.body.playerId
    const zappyId = req.body.zappyId
    if(!(zappyId in zappyMap)) {
        res.status(437).send("zappyId not found")
    }
    const zappyValue = zappyMap[zappyId].value
    const zappyName = zappyMap[zappyId].name

    if(playerId in players) {
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
    else {
        res.status(646).send("playerId not found")
    }
}

const top10 = (req, res) => {
    const ranks = Object.keys(players).sort((a, b) => players[b].points - players[a].points).splice(0,10).map(id => { return {"id": id, "name": players[id].name, "points": players[id].points}})
    res.status(200).send(ranks)
}

const addZappy = (req, res) => {
    const zappyName = req.body.name
    const zappyImgUrl = req.body.imgUrl
    const zappyValue = req.body.value
    const zappyId = zappyIds.length
    if(zappyId in zappyMap) {res.status(648).send(`We have enough ${zappyName}'s`); return}
    zappyIds.push(zappyId)
    zappyMap[zappyId] = {"name": zappyName, "value": zappyValue}
    const response = {"id": zappyId, "name": zappyName, "value": zappyValue}
    res.status(200).send(response)
}

const addManyZappys = (req, res) => {
    let newZappys = req.body
    const zappyNameSet = new Set()
    Object.keys(zappyMap).forEach(zappy => {zappyNameSet.add(zappyMap[zappy].name)})
    const response = []
    newZappys.forEach(zappy => {
        if(!zappyNameSet.has(zappy.name)) {
            const id = zappyIds.length
            zappyIds.push(id)
            zappyMap[id] = {"name": zappy.name, "value": zappy.value}
            zappy.id = id
            response.push(zappy)
        }
    })
    if(!newZappys.length) {res.status(666).send("Nothing added; find better llamas"); return}
    res.status(200).send(newZappys)
}

const getAllZappys = (req, res) => {
    res.status(200).send(zappyMap)
}