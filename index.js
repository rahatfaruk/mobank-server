const express = require('express')
require('dotenv').config()
const cors = require('cors')

// vars
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use( cors() )
app.use( express.json() )

app.get('/', (_, res) => res.send('Welcome to backend!'))

app.listen(port, () => console.log('listening from server!'))