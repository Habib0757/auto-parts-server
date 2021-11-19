const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");

require("dotenv").config();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// create uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vay9y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


// new client
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// server connection
const server = async () => {
  try {
    await client.connect();
    const database = client.db("auto-cars");
    const userCollection = database.collection("users");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const partsCollection = database.collection("parts");

    app.get("/part/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await partsCollection.findOne(query);

      res.json(result);
    });

    app.get("/parts", async (req, res) => {
      const limit = +req.query.limit;

      let result;
      if (limit) {
        result = await partsCollection
          .find({})
          .sort({ _id: -1 })
          .limit(limit)
          .toArray();
      } else {
        result = await partsCollection.find({}).toArray();
      }

      res.json(result);
    });

    // add new parts 
    app.post("/parts", async (req, res) => {
      const result = await partsCollection.insertOne(req.body);
      res.send(result);
    });

    app.delete("/part/:id", async (req, res) => {
      const result = await partsCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });

      res.json(result);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();

      res.json(result);
    });

    // get all users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();

      res.json(result);
    });

    // get a user
    app.get("/user/:email", async (req, res) => {
      const result = await userCollection.findOne({ email: req.params.email });

      res.json(result);
    });

    // add a review
    app.post("/review", async (req, res) => {
      const review = req.body;

      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // add a order
    app.post("/order", async (req, res) => {
      const order = req.body;

      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // get all order 
    app.get("/orders", async (req, res) => {

      const email = req.query.email;

      let result;
      if (email) {
        result = await orderCollection.find({ email: email }).toArray();
      } else {
        result = await orderCollection.find({}).toArray();
      }

      res.json(result);
    });

    // delete order
    app.delete("/order/:id", async (req, res) => {
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });

      res.json(result);
    });

    // approve order 
    app.put("/order", async (req, res) => {
      const id = req.query.id;
      const order = req.body;

      const updateDoc = {
        $set: { order: order },
      };

      console.log(id);

      const result = await orderCollection.updateOne(
        { _id: ObjectId(id) },
        updateDoc,
        {
          upsert: false,
        }
      );

      res.json(result);
    });




    // add user to db
    app.put("/users", async (req, res) => {
      const userData = req.body;
      const filter = { email: userData.email };
      const options = { upsert: true };
      const updatedUser = {
        $set: { ...userData },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.json(result);
    });

    //
  } finally {
    // await client.close();
  }
};
server().catch(console.dir);

// getting server
app.get("/", (req, res) => {
  res.send("Hello world! Welcome to Auto Parts Server");
});

// running server on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`);
});
