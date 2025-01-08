require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ph-b10-a10.web.app",
      "https://ph-b10-a10.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies["ph_b10_a10"];
  if (!token) {
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, process.env.PRIVATE_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

const verifyUser = (req, res, next) => {
  const { email } = req.body;
  if (email !== req.user.email) {
    return res.status(401).send("Access Denied");
  }
  next();
};

const port = process.env.PORT || 3000;

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.ashqk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Creating database
    const database = client.db("campaigns_db");
    const campaignCollections = database.collection("campaignCollections");
    const donatedCollections = database.collection("donatedCollections");

    // Auth api start
    app.post("/jwt", async (req, res) => {
      const { email } = req.body;
      const token = jwt.sign({ email }, process.env.PRIVATE_KEY, {
        expiresIn: "1h",
      });
      res.cookie("ph_b10_a10", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res.send({ acknowledgement: true, status: "cookie created" });
    });

    app.post("/logout", (req, res) => {
      res.clearCookie("ph_b10_a10", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res.send({ acknowledgement: true, status: "cookie deleted" });
    });
    // Auth api end

    // Add new campaign start
    app.post("/addCampaign", verifyToken, verifyUser, async (req, res) => {
      const result = await campaignCollections.insertOne(req.body);
      res.send(result);
    });
    // Add new campaign end

    // Get all campaigns start
    app.get("/allCampaign", async (req, res) => {
      const cursor = campaignCollections.find();
      const result = await cursor.toArray();

      res.send(result);
    });
    // Get all campaigns end

    // Get a signle campaign start
    app.get("/campaign/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const campaign = await campaignCollections.findOne(query);

      res.send(campaign);
    });
    // Get a signle campaign end

    // Get all of my campaigns start
    app.post("/myCampaign", verifyToken, verifyUser, async (req, res) => {
      const { email } = req.body;
      const query = { userEmail: email };
      const cursor = campaignCollections.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });
    // Get all of my campaigns end

    // Update my campaign start
    app.post(
      "/updateCampaign/:id",
      verifyToken,
      verifyUser,
      async (req, res) => {
        const { id } = req.params;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            imageURL: req.body.imageURL,
            campaignTitle: req.body.campaignTitle,
            campaignType: req.body.campaignType,
            description: req.body.description,
            minimumDonation: req.body.minimumDonation,
            deadline: req.body.deadline,
            userEmail: req.body.userEmail,
            userName: req.body.userName,
          },
        };
        const result = await campaignCollections.updateOne(
          filter,
          updateDoc,
          options
        );

        res.send(result);
      }
    );
    // Update my campaign end

    // Delete my campaign start
    app.delete("/myCampaign/:id", verifyToken, verifyUser, async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollections.deleteOne(query);

      res.send(result);
    });
    // Delete my campaign end

    // My donations start
    app.post("/addMyDonations", verifyToken, async (req, res) => {
      const result = await donatedCollections.insertOne(req.body);
      res.send(result);
    });

    // My donations end

    // Get all of my donations start
    app.post("/getMyDonations", verifyToken, verifyUser, async (req, res) => {
      const { email } = req.body;
      const query = { donorEmail: email };
      const cursor = donatedCollections.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });
    // Get all of my donations end

    // Get currently running campaigns start
    app.get("/currently-running-campaigns", async (req, res) => {
      const cursor = campaignCollections.find();
      const result = await cursor.toArray();
      const today = new Date();
      const runningCampaigns = result.filter((campaign) => {
        const date = new Date(campaign.deadline);
        if (today <= date) {
          return campaign;
        }
      });

      res.send(runningCampaigns);
    });
    // Get currently running campaigns end

    // Sort campaigns by donations start
    app.get("/sort-campaigns", async (req, res) => {
      const query = {};
      const sort = { minimumDonation: 1 };
      const cursor = campaignCollections.find(query).sort(sort);
      const data = await cursor.toArray();

      res.send(data);
    });
    // Sort campaigns by donations end
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Assaigment 10</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
