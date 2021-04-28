var express = require('express');
var router = express.Router();
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1195417",
  key: "18daa371eebed30fcef8",
  secret: "9dfd8f8695e23c19a538",
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
