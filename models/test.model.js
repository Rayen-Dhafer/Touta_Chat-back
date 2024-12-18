const mongoose = require("mongoose");


const testSchema = new mongoose.Schema({

    name: { type:String , require:true},
    number_questions: { type:Number , require:true},
    image: { type:String , require:true},
    content: { type:String , require:true},
    time: { type:Number , require:true},
    date: {
        year: { type:Number},
        month: { type:Number},
        day: { type:Number}
    },
    
}, { versionKey: false })




module.exports = mongoose.model("test",testSchema);