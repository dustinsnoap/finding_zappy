const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const app = express()
const PORT = process.env.PORT || 3333

app.use(helmet())
app.use(cors())
app.use(express.json())

const routes = require('./routes')
routes(app)

app.listen(PORT, () => {
    console.log("running...")
})