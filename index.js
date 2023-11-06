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
  const allJobCollection = client.db("jobsphere").collection("alljobs");
  const appliedJobCollection = client.db("jobsphere").collection("appliedjobs");
  app.get("/alljobs", async (req, res) => {
    const cursor = allJobCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });
  ///adding job api
app.post("/addjob", async (req, res) => {
  const newjob = req.body;
  console.log(newjob);
  const result = await allJobCollection.insertOne(newjob);
  res.send(result);
});
 ///applying job api
 app.post("/applyjob", async (req, res) => {
  const newjobtoApply = req.body;
  console.log(newjobtoApply);
  const result = await appliedJobCollection.insertOne(newjobtoApply);
  res.send(result);
});
///job details api
app.get("/specificjob/:id", async (req, res) => {
  const id = req.params.id;

  // console.log(" update id: ", id);
  const query = { _id: new ObjectId(id) };
  const result = await allJobCollection.findOne(query);
  console.log("to see details job", result);
  res.send(result);
});
///my job api

app.get('/myjobs',async (req, res) => {
  console.log(req.query.email);
  // console.log('token owner info', req.user)
  // if(req.user.email !== req.query.email){
  //     return res.status(403).send({message: 'forbidden access'})
  // }
  let query = {};
  if (req.query?.email) {
      query = { useremail: req.query.email }
  }
  const result = await allJobCollection.find(query).toArray();
  res.send(result);
})




/// update applicants number api

app.get('/updateapplicantnumber/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  // const jobdata = req.body;
  // console.log(jobdata);
  const updatedjobdata = {
      $inc: {
          // status: updatedBooking.status
          JobApplicantsNumber: 1
      },
  };
  const result = await allJobCollection.updateOne(filter, updatedjobdata);
  console.log( "result from update", result )
  res.send(result);
})
app.get("/", (req, res) => {
    res.send("job sphere server is running");
  });
  
app.listen(port, () => {
    console.log(
      `job sphere Server is running on port: ${port}, ${process.env.DB_USER},${process.env.DB_PASS} `
    );
  });
  