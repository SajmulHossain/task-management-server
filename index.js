const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://task-management-sajmul.web.app",
      "http://localhost:5173",
    ],
  })
);


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
    const taskCollection = db.collection('tasks');

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

    app.post('/tasks', async(req, res) => {
      const body = req.body;
      const result = await taskCollection.insertOne(body);
      res.send(result);
    })

    app.get('/tasks/:email', async(req, res) => {
      const { email } = req.params;
      const result = await taskCollection.find({author: email}).toArray();
      res.send(result);
    })

    app.patch("/tasks/:id", async(req, res) => {
      const data = req.body;
      const { id } = req.params;
      const query = { _id: new ObjectId(id) }
      const updatedData = {
        $set: data
      }
      const result = await taskCollection.updateOne(query, updatedData);
      res.send(result);
    })

    app.get('/task/:id', async(req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    })

    app.put('/task/:id', async(req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const data = req.body;
      const updatedData = {
        $set: data
      }

      const result = await taskCollection.updateOne(query, updatedData);
      res.send(result);
    })
    
    app.delete('/task/:id', async(req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
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