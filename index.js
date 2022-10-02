//express : création des apis 
//mongoose : biblio base de donnees mongodb
//cors : autorisation de la consomation des apis

//nodemon

// node-mailer : envoie des email
//connect-multiparty : upload des images


const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const multiparty = require('connect-multiparty')
const multipartyMiddleware = multiparty({uploadDir: './uploads'})

// config du serveur
var serveur = express()
serveur.use(cors())
serveur.use(express.json()) // lire le contenu du formaulaire

serveur.use(express.static('./')) // lire les fichier (images)
// connexion à la base de données
mongoose.connect("mongodb://localhost:27017/mygcord_db", () => {
    console.log('mongo connected')
})


const userCtrl = require('./utilisateurs.controller')
serveur.post('/inscription', userCtrl.inscription)
serveur.post('/login' , userCtrl.login)
serveur.post('/emailexist' , userCtrl.emailexist)
serveur.post('/validate' , userCtrl.validate)
serveur.post('/savepassword' , userCtrl.savepassword)
serveur.post('/sendCode' , userCtrl.sendCode)
serveur.post('/Upcouverture' , userCtrl.Upcouverture)
serveur.post('/getuser' , userCtrl.getuser)
serveur.get('/getall' , userCtrl.getall)







serveur.post('/upload' , multipartyMiddleware , (requete , reponse)=>{
    var file = requete.files

    console.log(file)
    reponse.send(file)
})

serveur.listen(3000, () => {
    console.log('server runnn')
})