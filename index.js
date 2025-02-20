const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use(cors());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.saftd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("tasks");
    const userCollection = db.collection("users");

    app.post("/user/:email", async(req, res) => {
      const data = req.body;
      const { email } = req.params;

      const isExist = await userCollection.findOne({email});
      if(isExist) {
       return res.send({message: 'user already exist'})
      }

      const result = await userCollection.insertOne(data);
      res.send(result);
    })

    app.get("/users", async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    await client.connect();
    
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Task management server is running!");
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})