module.exports = (req, res) => {
  const hubChallenge = req.query['hub.challenge'];

  const hubMode = req.query['hub.mode'];
  const verifyToken = (req.query['hub.verify_token']) === 'coronacare';

  if(verifyToken && hubMode) {
    res.status(200).send(hubChallenge);
  } else {
    res.status(403).end();
  }
}
