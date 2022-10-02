const mongoose = require('mongoose')

const schema = mongoose.Schema({
    name : String,
    tag : String,
    email : String,
    password : String,
    image : String,
    couverture: String,
    verif_code : String,
    validation : Number
})

module.exports = mongoose.model('utilisateur' , schema)

