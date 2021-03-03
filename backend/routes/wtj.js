const express = require("express");
const Pushover = require('pushover-notifications');
const dotenv = require("dotenv");
const router = express.Router();
const checkpoint = require('../models/checkpoint');
const DISTANCE = 4439;
var maintenanceValue = false;
const distance = require('../models/distance');
dotenv.config();
var pushover1 = new Pushover({token:process.env.WALKTOJERUSALEMPUSH,user:process.env.PUSHUSERKEY});
const crypto = require('crypto')
const sigHeaderName = 'X-Hub-Signature'
function verifyPostData(req, res, next) {
  const payload = JSON.stringify(req.body)
  if (!payload) {
    return next('Request body empty')
  }

  const sig = req.get(sigHeaderName) || ''
  const hmac = crypto.createHmac('sha1', process.env.SECRET)
  const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8')
  const checksum = Buffer.from(sig, 'utf8')
  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
  }
  return next()
}
router.post("/github/update",verifyPostData,(req,res,next)=>{
  console.log('Change Detected Applying Update');
 // console.log(req.headers);
  const { exec } = require("child_process");
  //TestChange

  exec(
    "git pull",
    (err, stdout, stderr) => {}
  );
  res.send('OK')
})
router.get("",(req,res,next)=>{
  if (maintenanceValue == "true"){
    maintenanceValue = true;
  } else if (maintenanceValue == "false"){
    maintenanceValue = false
  };
  //console.log(req.connection.remoteAddress)
  res.send({maintenance:maintenanceValue});
});
router.get("/triggermaintenance/:value",(req,res,next)=>{
  if (req.query.authorization != process.env.HOMEAUTOKEY){
    res.sendStatus(403);
    return;
  };
  maintenanceValue = req.params['value'];
  res.json({value:maintenanceValue});
});
router.post("/submitwalk/:auth",(req,res,next)=>{
  if (req.params['auth'] != process.env.WTJAUTH){
    res.sendStatus(403);
    return;
  };
  var newwalk = new distance({
    distance:req.body.distance,
    initials:req.body.init,
    timestamp:new Date()
  });
  newwalk.save();
  var msg = {
    "message": req.body.init + " has submitted a walk of "+req.body.distance,
    "title": "New Walk",
    "priority":0,
    "device":"JacksPhone"
  };
  pushover1.send(msg);
  res.json({message:'OK'})
});
router.get("/gettotaldistance/:auth",(req,res,next)=>{
  if (req.params['auth'] != process.env.WTJAUTH){
    res.sendStatus(403);
    return;
  };
  var totalCount = 0;
  distance.find({})
  .then((result)=>{
    if (!development){
      for (resultIdx in result){
        totalCount += result[resultIdx].distance
      };
    } else {
      totalCount = fakeNumber;
    }
  //  console.log(totalCount);
    var totalPercent = Math.ceil((totalCount / DISTANCE) * 100);
  //  console.log(totalPercent)
    res.json({
      total:totalCount,
      percent:totalPercent
    });
  })
});
router.get("/getcheckpoint/:name/:auth",(req,res,next)=>{
  if (req.params['auth'] != process.env.WTJAUTH){
    res.sendStatus(403);
    return;
  };
  checkpoint.findOne({name:req.params['name']})
  .then((result)=>{
    res.json({data:result})
  })
})
router.get("/allcheckpoints/:auth",(req,res,next)=>{
  if (req.params['auth'] != process.env.WTJAUTH){
    res.sendStatus(403);
    return;
  };
  checkpoint.find({})
  .then((result)=>{
    var checkArray = new Array();
    for (resultIdx in result){
      var object = {
        disabled:false,
        name:result[resultIdx].name,
        cache:{filled:false}
      }
      checkArray.push(object);
    };
    res.json({checkpoints:checkArray});
  });
});
router.get("/checkpoint/:auth",(req,res,next)=>{
  if (req.params['auth'] != process.env.WTJAUTH){
    res.sendStatus(403);
    return;
  };
  var totalCount = 0;
  distance.find({})
  .then((result)=>{
    if (!development){
      for (resultIdx in result){
        totalCount += result[resultIdx].distance
      };
    } else {
      totalCount = fakeNumber;
    }

    checkpoint.find({})
    .then((result1)=>{
      for (checkIdx in result1){

        if (result1[checkIdx].distance == (totalCount - result1[checkIdx].takeoff)){
          console.log('ye')
          var current = result1[checkIdx];
          for (finalCheckIdx in result1){
            //console.log(result1[finalCheckIdx].takeoff == current.distance);
         //   console.log(current.distance)
            if (result1[finalCheckIdx].takeoff == current.distance){
              var totalPercent = 0;
              var obj = {
                name:result1[finalCheckIdx].name,
                distance:result1[finalCheckIdx].distance,
                percent:totalPercent
              };
          //    console.log(current)
              if (current == {}){
                var current = {
                  name:"Start",
                  distance:0,
                  takeoff:0,
                  info:{}
                }
              }
              res.json({current:current,next:obj,at:Number(checkIdx) -1})
              return;
            }
          }
        };


         if (result1[checkIdx].distance > totalCount){
         //  console.log(result1[checkIdx])
          var numberone = totalCount - result1[checkIdx].takeoff
           var numbertwo = result1[checkIdx].distance - result1[checkIdx].takeoff

          var totalPercent = Math.ceil((numberone / numbertwo) * 100);
          var obj = {
            name:result1[checkIdx].name,
            distance:result1[checkIdx].distance,
            percent:totalPercent
          }
          var display = result1[checkIdx - 1];


          if (display == undefined){
            var display = {
              name:"Start",
              distance:0,
              takeoff:0,
              info:{}
            }
          }
      //    console.log(display)

          res.json({next:obj,current:display,at:Number(checkIdx)-1});
          return;

        };
      }
      //console.log(totalCount)
    })
  })
});
router.post("/addcheckpoint",(req,res,next)=>{
  if (req.params['auth'] != process.env.WTJAUTH){
    res.sendStatus(403);
    return;
  };
  var newCheckpoint = new checkpoint({
    name:req.body.name,
    distance:req.body.distance,
    info:{}
  });
  newCheckpoint.save();
  res.send(200)
});

var development = false;
var fakeNumber = 550;
router.get("/confirmadmin/:code",(req,res,next)=>{
  if (req.params['code'] == undefined){
    res.sendStatus(403);
  };
  var code = req.params['code'];
  var correctCode = process.env.ADMINCODE;

  if (code == correctCode){
    res.json({correct:true});
  } else {
    res.json({correct:false});
  };

});
router.get("/getwalkedtoday/:init/:auth",(req,res,next)=>{
  if (req.params['auth'] != process.env.WTJAUTH){
    res.sendStatus(403);
    return;
  };
  distance.find({

      "timestamp" : {
        $lt: new Date(),
        $gte: new Date(new Date().setDate(new Date().getDate()-1))
      }
  })
  .then((result)=>{
    var storedNumber = 0;
    var selfNumber = 0;
    for (let resultIdx in result){
      storedNumber = storedNumber + result[resultIdx].distance;
      if (result[resultIdx].initials == req.params['init']){
        selfNumber = selfNumber + result[resultIdx].distance
      }
    };
    res.json({total:storedNumber,self:selfNumber});
  });
});

module.exports = router;
