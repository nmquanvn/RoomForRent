const express = require('express');
const morgan = require('morgan'); // log request
require('express-async-errors'); // handle async errors
const cors = require('cors'); // allow access from another web server
const PORT = process.env.PORT || 3000;
const app = express();
const fileUpload = require('express-fileupload');
const IBMCloud = require('./utils/IBMCloud');
const IBMConfig = require('./configs/IBM.json');
const randomstring = require('randomstring');
const path = require('path');
// hide log when testing
if (!process.env.IS_TEST) {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Hello
app.get('/', function (req, res) {
  res.end('Hello from The Best Solution backend!');
});

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/user', require('./routes/user.route'));
app.use('/api/motel', require('./routes/motel.route'));
app.use('/api/rating', require('./routes/rating.route'));
//app.use('/api/conversation', require('./routes/conversation.route'));

// Test upload
// app.post('/', function (req, res) {
//   var myfile = req.files.myFile;
//   IBMCloud.uploadItem(myfile, 'Test');
//   res.end('OK');
// });
app.delete('/api/photo', function (req, res) {
  IBMCloud.deleteItems(req.body.files.split(';'));
  res.status(200).json({ success: true });
});
app.post('/api/photo', function (req, res) {
  if (!req.files) {
    return res.status(400).json({ err_msg: 'Please upload an file' });
  }

  var myfile = req.files.myFile;

  // Make sure the image is a photo
  if (!myfile.mimetype.startsWith('image')) {
    return res.status(400).json({ err_msg: 'Please upload an image file' });
  }
  myfile.name = `photo_${randomstring.generate(10)}${
    path.parse(myfile.name).ext
  }`;
  IBMCloud.uploadItem(myfile, 'Images');
  res
    .status(200)
    .json({ link: `${IBMConfig.BucketURL}/Images/${myfile.name}` });
});
// Error Handlers
app.use(function (req, res, next) {
  res.status(404).send({
    error_message: 'Endpoint not found!',
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({
    error_message: 'Something broke!',
  });
});

//Socket Declare
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const client = require('./utils/socket');

if (!process.env.IS_BUILD) {
  server.listen(PORT);
  console.log(
    `The Best Solution backend api is running at http://localhost:${PORT}`
  );
  //Socket Handle
  io.on('connection', (socket) => {
    client.addUser(socket);
    client.userSendMessenger(socket);
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
    if (!process.env.IS_TEST) console.log('Socket.io is Running');
  });
}

// Export for testing
module.exports = app;
