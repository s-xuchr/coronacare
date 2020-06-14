/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 */

'use strict';

const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const fetch = require('node-fetch');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let Wit = null;
let log = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  log = require('../').log;
} catch (e) {
  Wit = require('node-wit').Wit;
  log = require('node-wit').log;
}

// Webserver parameter
const PORT = process.env.PORT || 8445;

// Wit.ai parameters
// NEED TO CHANGE THIS BASED ON YOUR SERVER
const WIT_TOKEN = 'GZFTRT7V43TLTMOLPVSF27UL7RUSRFBC';

// Messenger API parameters
const FB_PAGE_TOKEN = 'EAAkbrgV33TIBABzpqJ0ildsYw2ziZAuQWR0A9UQVYsBKB18YgMEnCWFw5qFqK9WIaplA5F6QcsSqi9SKWzZBbMyfy3zBemveWgPZBPj6zvjaFMuFJquQ1OZCZAmpikkHO4HjPGWF1iCBKusd7ZAU6YF1oJyHx9cisr6vykE7IVkAZDZD';
if (!FB_PAGE_TOKEN) { throw new Error('missing FB_PAGE_TOKEN') }
const FB_APP_SECRET = '298f090090cf1708e5a62bb81e01e9e9';
if (!FB_APP_SECRET) { throw new Error('missing FB_APP_SECRET') }

let FB_VERIFY_TOKEN = null;
crypto.randomBytes(8, (err, buff) => {
  if (err) throw err;
  FB_VERIFY_TOKEN = buff.toString('hex');
  console.log(`/webhook will accept the Verify Token "${FB_VERIFY_TOKEN}"`);
});

// ----------------------------------------------------------------------------
// Messenger API specific code

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference

const fbMessage = (id, text) => {
  const body = JSON.stringify({
    recipient: { id },
    message: { text },
  });
  const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
  return fetch('https://graph.facebook.com/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};

// ----------------------------------------------------------------------------
// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  logger: new log.Logger(log.INFO)
});

// Starting our webserver and putting it all together
const app = express();
app.use(({method, url}, rsp, next) => {
  rsp.on('finish', () => {
    console.log(`${rsp.statusCode} ${method} ${url}`);
  });
  next();
});
app.use(bodyParser.json({ verify: verifyRequestSignature }));

// Webhook setup
app.get('/', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === 'coronacare') {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

// Message handler
app.post('/', (req, res) => {
  // Parse the Messenger payload
  // See the Webhook reference
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message && !event.message.is_echo) {
          // Yay! We got a new message!
          // We retrieve the Facebook user ID of the sender
          const sender = event.sender.id;

          // We could retrieve the user's current session, or create one if it doesn't exist
          // This is useful if we want our bot to figure out the conversation history
          // const sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          const {text, attachments} = event.message;

          if (attachments) {
            // We received an attachment
            // Let's reply with an automatic message
            fbMessage(sender, 'Sorry I can only process text messages for now.')
            .catch(console.error);
          } else if (text) {
            // We received a text message
            // Let's run /message on the text to extract some entities, intents and traits
            wit.message(text).then(({entities, intents, traits}) => {
              // You can customize your response using these
              console.log(intents);
              console.log(entities);
              console.log(traits);
              // For now, let's reply with another automatic message

              let intentname = "undefined";

              if(intents.length >= 1) {
                intentname = intents[0].name;
              }

              console.log(intentname);

              if(intentname === 'greetingIntent') {
                fbMessage(sender, "Hi, this is Coronacare, a chatbot that helps you stay in touch with COVID-19 info and resources! May I get your name?");
              } else if(intentname === 'getNameIntent') {
                fbMessage(sender, "Nice to meet you, " + entities["name:name"][0].body + "! How may I help you? Try asking something about COVID-19 and your mental health.");
              } else if (intentname === 'preventionIntent') {
                fbMessage(sender, "The World Health Organization provides advice for COVID-19 prevention and safety at https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public");
              } else if (intentname === 'mentalHealthIntent') {
                fbMessage(sender, "I'm so sorry to hear that. There are plenty of therapists available at https://www.psychologytoday.com/us/therapists, based on your location.");
              } else if (intentname === 'matchTherapistIntent') {
                fbMessage(sender, "There are plenty of therapists available at https://www.psychologytoday.com/us/therapists, based on your location.")
              } else if (intentname === 'covidFatalChancesIntent') {
                fbMessage(sender, "Older individuals or those with other health conditions have a higher chance of dying from COVID-19. For more information, visit https://www.bbc.com/news/health-51674743");
              } else if (intentname === 'highRiskIntent') {
                fbMessage(sender, "Check out this resource provided by Mather Hospital: https://www.matherhospital.org/wellness-at-mather/what-are-your-chances-of-catching-covid-19/");
              } else if (intentname === 'maskRegulationsIntent') {
                fbMessage(sender, "Masks are highly recommended in public settings to protect yourself and others. Visit the World Health Organization's recommendation here https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/when-and-how-to-use-masks");
              } else if (intentname === 'quarantineIntent') {
                fbMessage(sender, "Check out this compiled list of online games to play during quarantine! https://docs.google.com/document/u/1/d/10iOD7Wy_YU4NmkPU7ZH7YTrq11qJAANjZZ0PAotKhR8/mobilebasic");
              } else if (intentname === 'getCovidCasesIntent') {
                //FIXME
                var Http = new XMLHttpRequest();
                const url = 'https://api.thevirustracker.com/free-api?global=stats';
                Http.open("GET", url);
                Http.responseType = 'json';
                Http.send();
                Http.onreadystatechange=(e)=>{
                  if (Http.readyState == 4 && Http.status == 200) {
                    var result = Http.responseText;
                    var responseObj = JSON.parse(result);
                    var cases = responseObj.results[0].total_cases;

                    function numberWithCommas(x) {
                      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }

                    fbMessage(sender, "There are currently " + numberWithCommas(cases) + " total cases worldwide.").catch(() => {});
                  }
                }
              } else if (intentname === 'getCovidDeathsIntent') {
                //FIXME
                var Http = new XMLHttpRequest();
                const url = 'https://api.thevirustracker.com/free-api?global=stats';
                Http.open("GET", url);
                Http.responseType = 'json';
                Http.send();
                Http.onreadystatechange=(e)=>{
                  if (Http.readyState == 4 && Http.status == 200) {
                    var result = Http.responseText;
                    var responseObj = JSON.parse(result);
                    var deaths = responseObj.results[0].total_deaths;
                    var cases = responseObj.results[0].total_cases;
                    var percentage = deaths/cases * 100;

                    function numberWithCommas(x) {
                      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }

                    fbMessage(sender, "There are currently " + numberWithCommas(deaths) + " total deaths worldwide with " + numberWithCommas(cases) + " total cases, making coronavirus have a " + percentage.toFixed(2) + "% lethality rate right now").catch(() => {});
                  }
                }
              } else if (text === "beam me up scotty") {
                fbMessage(sender, "hi aunty");
              } else if (intentname === 'funIntent') {
                fbMessage(sender, 'So many coronavirus jokes out there, it’s a pundemic.');
              }

              else {
                fbMessage(sender, `We've received your message: '${text}', but weren't able to process it. Please try again with more specific words. Thanks!`);
              }
            })
            .catch((err) => {
              console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
          }
        } else {
          console.log('received event', JSON.stringify(event));
        }
      });
    });
  }
  res.sendStatus(200);
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];
  console.log(signature);

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', FB_APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

app.listen(PORT);
console.log('Listening on :' + PORT + '...')
