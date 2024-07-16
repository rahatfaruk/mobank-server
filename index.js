const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb')

// vars
const app = express()
const port = process.env.PORT || 5000
const uriMDB = `mongodb+srv://${process.env.UserMDB}:${process.env.PasswordMDB}@cluster0.ympa4ek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uriMDB, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true,}
})

// middleware
app.use( cors() )
app.use( express.json() )


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    // ## req-group: get
    app.get('/', (_, res) => res.send('Welcome to backend!'))

    // check successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.log(err.message);
  }
}
run().catch(console.dir);

// listen to the server
app.listen(port, () => console.log('listening from server!'))