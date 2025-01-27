const express = require('express')
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: ['http://localhost:5173',],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(bodyParser.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwmcx9f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




async function run() {
  try {
    
    
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db('CMFFoodCorner').collection('users')
    const menuCollection = client.db('CMFFoodCorner').collection('menus')
    const orderCollection = client.db('CMFFoodCorner').collection('orders')


    

    // create user
    const createUser = async(username, password) =>{
      const hashedPassword =await bcrypt.hash(password, 10) 
      await userCollection.insertOne({username, password:hashedPassword})
   }
   // create menu item
   const menuItem = async(name, category, price, availability = true) =>{
      await menuCollection.insertOne(name, category, price, availability)
   }
   // create order item
   const orderItem = async(userId, items, totalAmount, status = "Pending") =>{
      await orderCollection.insertOne({
       userId, 
       items, 
       totalAmount, 
       status,
       createAt:new Date(),
      })
   }


   // Registr
   app.post('/register', async(req, res) =>{
       const {username, password} = req.body
       if(!username || !password) return res.status(400).send('Fields are required')
           const userExist = await userCollection.findOne({username})
       if(userExist) return res.status(400).send('User already exists');

       await createUser(username, password)
       return res.status(201).send('User register successfully')
   })

   // Login
   app.post('/login', async(req, res) =>{
       const {username, password} = req.body
           const user = await userCollection.findOne({username})
       if(!user || !(await bcrypt.compare(password, user.password))){
           return res.status(401).send('Invelids credentials');
       }

       const token = jwt.sign({id:user._id, username:user.username}, process.env.ACCESS_TOKEN_SECRET,{
           expiresIn: '365d'
      })
      res.send({ token })

   })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('CMP Food corner')
  })
  app.listen(port, () => {
    console.log(`CMP Food corner is running on port ${port}`)
  })