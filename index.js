const express = require("express");
const path = require('path')



var development = true;


const bodyParser = require("body-parser");

const app = express();


//app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.use("/", express.static(path.join(__dirname,"dist","walktojerusalem")));


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type,Accept,Authorization,Auth"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS,PUT"
  );
  next();
});


 
  app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,"dist","walktojerusalem","index.html"));
  });

module.exports = app;
