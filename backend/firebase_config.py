import firebase_admin
from firebase_admin import credentials,db


cred = credentials.Certificate("firebase-admin.json")
firebase_admin.initialize_app(cred,{
  "databaseURL": "https://ir-lock-project-default-rtdb.firebaseio.com/"
})