const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const wtjRoute = require('./routes/wtj');

const app = express();
dotenv.config();

mongoose.connect(process.env.DBURI,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useFindAndModify:true,
  useCreateIndex:true
})
.then(()=>{
  console.log('Connected To Database');
})
.catch(()=>{
  console.log('Connecton Failed');
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type,Accept,Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS,PUT"
  );
  next();
});
app.use("/api/walk",wtjRoute);
app.get("/",(req,res,next)=>{
  res.sendStatus(200);
});

module.exports = app;
