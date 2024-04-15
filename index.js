
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const multiparty = require('connect-multiparty')
const multipartyMiddleware = multiparty({uploadDir: './uploads'})


const userRoutes = require("./routes/user.routes")
const adminRoutes = require("./routes/admin.routes")



var serveur = express()
serveur.use(cors())
serveur.use(express.json()) 
serveur.use(express.static('./')) 


//nodemon

mongoose.connect("mongodb://localhost:27017/Digital_City_Db", () => {

        console.log("database connected successfully ",mongoose.connection.port)

})



serveur.post('/upload' , multipartyMiddleware , (requete , reponse)=>{

    var path =''
    if(requete.files.files){
        path= requete.files.files.path
    }
    reponse.send({path : path})
    
})




serveur.use("/user",userRoutes)
serveur.use("/admin",adminRoutes)








serveur.listen(3000, () => {
    console.log('server runnn')
})


