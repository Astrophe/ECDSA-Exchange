const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

  var wallets = []
  for (var i = 0; i < 3; i++) {
    const key = ec.genKeyPair();
    privateKey = key.getPrivate().toString(16)
    publicKey = key.getPublic().encode('hex').toString()
    const wallet = {
      privateKey: privateKey,
      publicKey: publicKey
    }
    wallets.push(wallet)
}
console.log(wallets)

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const balances = Object.fromEntries(wallets.map(key => [key.publicKey, 100]));
balances[wallets[1].publicKey] = 50;
balances[wallets[2].publicKey] = 75;
console.log(balances)
app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, private_key} = req.body;
  if (private_key == wallets[0].privateKey) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  }
  else {
    console.log("invalid private key")
  }
  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
