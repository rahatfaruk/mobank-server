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

    // init db, collection
    const database = client.db('pha-mobank')
    const collUsers = database.collection('users')
    
    // ## req-group: get
    app.get('/', (_, res) => res.send('Welcome to backend!'))

    // register new user
    app.post('/users/register', async (req, res) => {
      const newUser = req.body

      // return error if user already exist in collection
      const existedUser = await collUsers.findOne({email: newUser.email})
      if (existedUser) {
        return res.status(409).send({status:'existed', message: 'You have registered before with the email!'})
      }
      
      // insert user with pending status to db
      newUser.status = "pending"
      const result = await collUsers.insertOne(newUser)
      res.send(result)
    })


    // ## check successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.log(err.message);
  }
}
run().catch(console.dir);

// listen to the server
app.listen(port, () => console.log('listening from server!'))