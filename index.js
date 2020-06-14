const express = require('express');
const bodyParser = require('body-parser');
const { FacebookMessenger } = require('jovo-platform-facebookmessenger');
const { WitAiSlu } = require('jovo-slu-witai');

const verification = require('./controllers/verification');
// const msgWebhook =  require('./controllers/messageWebhook');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(
//   // new FacebookMessenger()
//   // new WitAiSlu({
//   //     token: 'yourToken'
//   // })
// );

app.listen(3000, () => console.log('Webhook server is listening, port 3000!'));

app.get('/', verification);
// app.post('/', msgWebhook);
