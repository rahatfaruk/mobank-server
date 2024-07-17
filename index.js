const express = require('express')
require('dotenv').config()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb')

// vars
const app = express()
const port = process.env.PORT || 5000
const uriMDB = `mongodb+srv://${process.env.UserMDB}:${process.env.PasswordMDB}@cluster0.ympa4ek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const saltRounds = 10;

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

    // > generate auth token
    app.get('/get-auth-token', async (req, res) => {
      const email = req.query.email
      // generate token
      const token = jwt.sign({email}, process.env.PrivateKeyJWT, {expiresIn: '10h'})

      res.send(token)
    })

    // > register new user
    app.post('/users/register', async (req, res) => {
      const newUser = req.body

      // return error if user already exist in collection
      const existedUser = await collUsers.findOne({email: newUser.email})
      if (existedUser) {
        return res.status(409).send({status:'existed', message: 'You have registered before with the email!'})
      }
      
      // convert user's normal pin into hashed pin
      const pinHashed = await bcrypt.hash(newUser.pin, saltRounds)
      newUser.pin = pinHashed
      // insert user with pending status into db
      newUser.status = "pending"
      const result = await collUsers.insertOne(newUser)
      res.send(result)
    })

    // > login user
    app.post('/user-login', async (req, res) => {
      const userInfo = req.body

      // check if email or telephone is provided
      const isTelephone = /[0-9]+/g.test(userInfo.emailOrTelephone)
      const isEmail = /\S+@\S+\.\S+/g.test(userInfo.emailOrTelephone)

      // build query by email or telephone
      const query = {}
      if (isEmail) {
        query.email = userInfo.emailOrTelephone
      } else if (isTelephone) {
        query.telephone = userInfo.emailOrTelephone
      }

      // get user data; check user existence
      const resultUser = await collUsers.findOne(query)
      if (!resultUser) {
        return res.status(409).send({message: 'No user found!'})
      }

      // check sender's pin with result-user's hashed pin
      const isValidPassword = await bcrypt.compare(userInfo.pin, resultUser.pin)
      if (!isValidPassword) {
        return res.status(409).send({message: 'password not matched!'})
      }
      // check result-user's status
      if (resultUser.status === 'pending') {
        return res.status(409).send({message: 'wait for admin approval your account!'})
      }

      // remove pin from result
      delete resultUser.pin
      res.send(resultUser)
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