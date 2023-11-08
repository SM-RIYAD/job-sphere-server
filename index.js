const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wacbf1n.mongodb.net/?retryWrites=true&w=majority`;
// middleware
// middleware
app.use(
  cors({
    origin: ["http://localhost:5173","https://job-sphere.web.app","https://job-sphere.firebaseapp.com"],
    credentials: true,
  })
);
const logger = (req, res, next) => {
  console.log("log: info", req.method, req.url);
  next();
};
app.use(express.json());

app.use(cookieParser());

///verify token
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

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

///auth related api
app.post("/jwt",logger, async (req, res) => {
  const user = req.body;
  console.log("user for token after login", user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
 res.cookie(
    "token",
    token,
    {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true: false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    }
    )
  
    .send({ success: true });
});

// res.cookie(
//   "token",
//   tokenValue,
//   {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production" ? true: false,
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//   }
//   )
  // Removing/Deleting cookie:
  // res.clearCookie(
  // "token",
  // {
  // maxAge: 0,
  // secure: process.env.NODE_ENV === "production" ? true: false,
  // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  // }
  // )



// res.cookie('token', token, {
//   httpOnly: true,
//   secure: true,
//   sameSite: 'none'
// })

////LOG OUT
app.post("/logout", async (req, res) => {
  const user = req.body;
  console.log("logging out", user);

  // clearCookie('token', { maxAge: 0 }).
  res.clearCookie(
    "token",
    {
    maxAge: 0,
    secure: process.env.NODE_ENV === "production" ? true: false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    }
    ).send({ success: true })

  // res.clearCookie("token", {
  //   maxAge: 0,
  //   secure: process.env.NODE_ENV === "production" ? true : false,
  //   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  // });
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

app.get("/myjobs",verifyToken, async (req, res) => {
  console.log(req.query.email);
  console.log("token owner info", req.user);
  if (req.user.email !== req.query.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  console.log("cookies test", req.cookies);
  let query = {};
  if (req.query?.email) {
    query = { useremail: req.query.email };
  }
  const result = await allJobCollection.find(query).toArray();
  res.send(result);
});
///my applied jobs api

app.get("/myappliedjobs", logger,verifyToken, async (req, res) => {
  console.log("cookies test", req.cookies);
  console.log(req.query.email);
  console.log("token owner info", req.user);
  if (req.user.email !== req.query.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  let query = {};
  if (req.query?.email) {
    query = { applicantEmail: req.query.email };
  }
  const result = await appliedJobCollection.find(query).toArray();
  res.send(result);
});

///update a job api
app.put("/updatejob/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const newjobtoUpdate = req.body;
  console.log("from body update", newjobtoUpdate);
  const newjob = {
    companyLogo: newjobtoUpdate.companyLogo,

    jobPhoto: newjobtoUpdate.jobPhoto,

    JobTitle: newjobtoUpdate.JobTitle,

    UserName: newjobtoUpdate.UserName,
    Location: newjobtoUpdate.Location,
    useremail: newjobtoUpdate.useremail,

    JobCategory: newjobtoUpdate.JobCategory,
    CompanyName: newjobtoUpdate.CompanyName,
    SalaryRange: newjobtoUpdate.SalaryRange,

    JobDescription: newjobtoUpdate.JobDescription,

    JobPostingDate: newjobtoUpdate.JobPostingDate,

    ApplicationDeadline: newjobtoUpdate.ApplicationDeadline,

    JobApplicantsNumber: newjobtoUpdate.JobApplicantsNumber,
  };
  console.log("new job", newjob);
  const job = {
    $set: {
      companyLogo: newjobtoUpdate.companyLogo,

      jobPhoto: newjobtoUpdate.jobPhoto,

      JobTitle: newjobtoUpdate.JobTitle,

      UserName: newjobtoUpdate.UserName,
      Location: newjobtoUpdate.Location,
      useremail: newjobtoUpdate.useremail,

      JobCategory: newjobtoUpdate.JobCategory,
      CompanyName: newjobtoUpdate.CompanyName,
      SalaryRange: newjobtoUpdate.SalaryRange,

      JobDescription: newjobtoUpdate.JobDescription,

      JobPostingDate: newjobtoUpdate.JobPostingDate,

      ApplicationDeadline: newjobtoUpdate.ApplicationDeadline,

      JobApplicantsNumber: newjobtoUpdate.JobApplicantsNumber,
    },
  };

  const result = await allJobCollection.updateOne(filter, job, options);
  console.log("updated obj", result);
  res.send(result);
});

/// update applicants number api

app.get("/updateapplicantnumber/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  // const jobdata = req.body;
  // console.log(jobdata);
  const updatedjobdata = {
    $inc: {
      // status: updatedBooking.status
      JobApplicantsNumber: 1,
    },
  };
  const result = await allJobCollection.updateOne(filter, updatedjobdata);
  console.log("result from update", result);
  res.send(result);
});

///delete a job api
app.delete("/deletejob/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await allJobCollection.deleteOne(query);
  console.log(result);
  res.send(result);
});
app.get("/", (req, res) => {
  res.send("job sphere server is running");
});

app.listen(port, () => {
  console.log(
    `job sphere Server is running on port: ${port}, ${process.env.DB_USER},${process.env.DB_PASS} `
  );
});
