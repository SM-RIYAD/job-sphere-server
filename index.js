const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 5000;
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wacbf1n.mongodb.net/?retryWrites=true&w=majority`;
const uri=`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wacbf1n.mongodb.net/?retryWrites=true&w=majority`
// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  
  const dbConnect = async () => {
    try {
      await client.connect();
      console.log("Database Connected!");
    } catch (error) {
      console.log(error.name, error.message);
    }
  };
  dbConnect();
app.get("/", (req, res) => {
    res.send("job sphere server is running");
  });
  
app.listen(port, () => {
    console.log(
      `job sphere Server is running on port: ${port}, ${process.env.DB_USER},${process.env.DB_PASS} `
    );
  });
  