const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

    id_user: { type:mongoose.Schema.Types.ObjectId , ref:"user"},
    id_test: { type:mongoose.Schema.Types.ObjectId , ref:"test"},
    percentage: String,
    result: String,
    
        date: {
                year: { type:Number},
                month: { type:Number},
                day: { type:Number}
        },
        
}, { versionKey: false })




module.exports = mongoose.model("result",resultSchema);
