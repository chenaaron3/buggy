var express = require('express');
var router = express.Router();
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1195417",
  key: "18daa371eebed30fcef8",
  secret: process.env.PUSHER_SECRET,
  cluster: "us3",
  useTLS: true
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/command', (req, res) => {
  console.log(req.body)
  pusher.trigger("buggy", "command", req.body);
  res.send("");
})

module.exports = router;
