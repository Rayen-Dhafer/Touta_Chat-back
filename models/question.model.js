const mongoose = require("mongoose");


const questionSchema = new mongoose.Schema({

    question: { type:String , require:true},
    A_answer: { type:String , require:true},
    B_answer: { type:String , require:true},
    C_answer: { type:String , require:true},
    D_answer: { type:String , require:true},
    correct_answer: { type:String , require:true},


    test_refers: { type:mongoose.Schema.Types.ObjectId , ref:"test"},


}, { versionKey: false })




module.exports = mongoose.model("question",questionSchema);