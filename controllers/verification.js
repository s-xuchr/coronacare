module.exports = (req, res) => {
  const hubChallenge = req.query['hub.challenge'];

  const hubMode = req.quey['hub.mode'];
  const verification = (req.query['hub.verify_token']) === 'coronacare_token';

  if (hubMode && verification) {
    res.status(200).send(hubChallenge);
  } else {
    res.status(403).end();
  }
}
