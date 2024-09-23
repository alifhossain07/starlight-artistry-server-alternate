const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@basicsexploring.cgr22.mongodb.net/?retryWrites=true&w=majority&appName=basicsExploring`;

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
    // Connect the client to the MongoDB server
    // await client.connect();

    // Select the 'craftDB' database and 'crafts' collection
    const database = client.db("craftDB");
    const craftsCollection = database.collection("crafts");

    console.log("Connected to craftDB and crafts collection");

    // GET all craft items
    app.get("/crafts", async (req, res) => {
      try {
        const cursor = await craftsCollection.find();
        const result = await cursor.toArray();  // Convert cursor to array
        res.status(200).json(result);  // Send the result back as JSON
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch crafts", error });
      }
    });

    // POST route to add a new craft item
    app.post("/crafts", async (req, res) => {
      const newCraftItem = req.body;
      console.log("New Craft Item:", newCraftItem);
      try {
        const result = await craftsCollection.insertOne(newCraftItem);  // Insert item into MongoDB
        res.status(201).json(result);  // Return the result to the frontend
      } catch (error) {
        res.status(500).json({ message: "Failed to add craft item", error });
      }
    });

    // GET a specific craft item by ID
    app.get("/crafts/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
      const filter = { _id: new ObjectId(id) };
      try {
        const item = await craftsCollection.findOne(filter);  // Find item by ID
        if (item) {
          res.status(200).json(item);  // Send back the item if found
        } else {
          res.status(404).json({ message: "Craft item not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch craft item", error });
      }
    });

    // DELETE a specific craft item by ID
    app.delete("/crafts/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
      const query = { _id: new ObjectId(id) };
      try {
        const result = await craftsCollection.deleteOne(query);  // Delete item by ID
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Craft item deleted" });
        } else {
          res.status(404).json({ message: "Craft item not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to delete craft item", error });
      }
    });

    // PUT route to update a specific craft item by ID
    app.put("/crafts/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCraftItem = req.body;

      const item = {
        $set: {
          name: updatedCraftItem.name,
          category: updatedCraftItem.category,
          details: updatedCraftItem.details,
          price: updatedCraftItem.price,
          quantity: updatedCraftItem.quantity,
          photoURL: updatedCraftItem.photoURL,
          email: updatedCraftItem.email,
        },
      };

      try {
        const result = await craftsCollection.updateOne(filter, item, options);  // Update the item by ID
        if (result.matchedCount === 1) {
          res.status(200).json({ message: "Craft item updated" });
        } else {
          res.status(404).json({ message: "Craft item not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to update craft item", error });
      }
    });

  } finally {
    // Uncomment this line if you want to close the connection after the operation
    // await client.close();
  }
}

run().catch(console.dir);

// Start the Express server
app.get("/", (req, res) => {
  res.send("Starlight Artistry Server is Running");
});

app.listen(port, () => {
  console.log(`Starlight Artistry Server is listening on port ${port}`);
});
