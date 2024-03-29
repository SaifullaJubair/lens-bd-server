require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5u9qcxt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    //---------All collection Start here---------
    const DB = client.db("lens-bd");
    const usersCollection = DB.collection("users");
    const lensCollection = DB.collection("lens");
    const categoryCollection = DB.collection("category");
    const sellsCollection = DB.collection("sells");
    // ---------All collection End here----------

    app.post("/signup", async (req, res) => {
      try {
        const { name, email, password } = req.body;
        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.json({ error: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create New User
        const newUser = {
          name,
          email,
          password: hashedPassword,
        };
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Login user

    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await usersCollection.findOne({ email });
        // Check if the user exists
        if (!user) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign(
          { _id: user._id, email: user.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );

        res.status(200).json({ message: "Login successful", token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const result = await usersCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // Lens api start here

    app.get("/lenses", async (req, res) => {
      try {
        const result = await lensCollection
          .find({})
          .sort({ releaseDate: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    //  lens get by id
    app.get("/lenses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await lensCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    //  lens add
    app.post("/add-lens", async (req, res) => {
      try {
        const result = await lensCollection.insertOne(req.body);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    //  lens update

    app.put("/update-lens/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await lensCollection.updateOne(query, {
          $set: req.body,
        });
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    //  lens delete
    app.delete("/delete-lens/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await lensCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // delete lenses many
    app.post("/bulk-delete-lenses", async (req, res) => {
      try {
        const ids = req.body.ids.map((id) => new ObjectId(id));
        const query = { _id: { $in: ids } };
        const result = await lensCollection.deleteMany(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Lens api end here

    // Sells Api start here

    // All Sells get
    app.get("/sells", async (req, res) => {
      try {
        const result = await sellsCollection
          .find({})
          .sort({ sellDate: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // Sells Post
    app.post("/sells", async (req, res) => {
      try {
        const result = await sellsCollection.insertOne(req.body);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // Sells Api end here
    // Category api start here

    app.get("/category", async (req, res) => {
      try {
        const result = await categoryCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }

      app.delete("/category/:id", async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await categoryCollection.deleteOne(query);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Internal server error" });
        }
      });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Lens-BD Server!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
