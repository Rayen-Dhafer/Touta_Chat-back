const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

        name: String,
        email: String,
        country: String,
        password: String,
        recovery_code: String,

        date: {
                year: { type:Number},
                month: { type:Number},
                day: { type:Number}
        },
        
}, { versionKey: false })




module.exports = mongoose.model("user",userSchema);



