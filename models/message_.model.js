const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    id_user: { type:mongoose.Schema.Types.ObjectId , ref:"user"},

    message: String,


        
}, { versionKey: false })




module.exports = mongoose.model("message",userSchema);

