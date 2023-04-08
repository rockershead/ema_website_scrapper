const admin = require('firebase-admin');
const serviceAccount = require('../keyfile.json');   //put in your own keyfile.json from google firebase
const firebase = require('firebase');



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)}
  
);

firebase.initializeApp(serviceAccount)

const db = admin.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);



module.exports = {db,firebase}
//module.exports = {db}
