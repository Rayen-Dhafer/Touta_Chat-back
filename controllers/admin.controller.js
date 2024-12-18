const test_model = require("../models/test.model");
const questionSchema = require("../models/question.model");
const user_model = require("../models/user.model");
const result_model = require("../models/result.model");
const message_model = require("../models/message_.model");



module.exports.create_test = async (req,res) => {
    try {

        let icon ="error"
        let title = "Error in create"
        const exist_test = await test_model.findOne({ name: req.body.name  })

        if( !exist_test ){
            
            let date = new Date();    
            const test = new test_model(req.body)

            test.date.year = date.getFullYear()
            test.date.month = (date.getMonth() + 1)
            test.date.day = date.getDate()

            await test.save();
            icon ="success"
            title = "Test has been created"


            return res.status(201).json({
                success: true,
                id:test._id,
                icon: icon,
                title: title
        
            })

        }else{
            return res.status(400).json({
                success: false,    
            })
        }




    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}


module.exports.create_question = async (req,res) => {
    try {



        for(let q of req.body.questions){
            const question = new questionSchema(q)
            question.test_refers = req.body.id
            await question.save();
        }                
        
        return res.status(201).json({
            success: true,
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}




module.exports.get_users = async (req,res) => {
    try {

        const users = await user_model.find()
        const tests = await test_model.find()
        let certifications= [{}]
        let i=0

        for(let u of users){
            
            let my_res = await result_model.distinct('id_test',{result:'Successful' , id_user: u._id }  )

            por = ( (my_res.length * 100) / tests.length ).toFixed(1);

            let c={}
            c.percentage = por+"%"
            c.number = my_res.length
            certifications[i]= c
            i++
            
        }
        
        return res.status(201).json({
            success: true,
            users: users,
            certifications: certifications,
            nb_tests : tests.length,
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}



module.exports.all_tests = async (req,res) => {
    try {


        const result_Suc = await result_model.find({result : "Successful" })
        const result_Uns = await result_model.find({result : "Unsuccessful" })

        const select_certificate = [
    {
        $group: {
            _id: '$id_test',
            resultCount: {
                $sum: {
                    $cond: [
                        { $eq: ['$result', 'Successful'] }, // If result is 'Successful'
                        1, // Increment by 1
                        0 // Otherwise, increment by 0
                    ]
                }
            },
            unsuCount: {
                $sum: {
                    $cond: [
                        { $ne: ['$result', 'Successful'] }, // If result is not 'Successful'
                        1, // Increment by 1
                        0 // Otherwise, increment by 0
                    ]
                }
            },
            distinctUserCount: { $addToSet: '$id_user' }
        }
    },
    {
        $lookup: {
            from: 'tests',
            localField: '_id',
            foreignField: '_id',
            as: 'test'
        }
    },
    {
        $unwind: '$test'
    },
    {
        $project: {
            _id: 1,
            resultCount: 1,
            unsuCount: 1,
            name: '$test.name',
            number_questions: '$test.number_questions',
            date: '$test.date',
            image: '$test.image',
            distinctUserCount: { $size: '$distinctUserCount' }
        }
    }
        ];

        const results_1 = await result_model.aggregate(select_certificate);


                const select_no_certificate = [
                    {
                        $lookup: {
                            from: 'results',
                            localField: '_id',
                            foreignField: 'id_test',
                            as: 'results'
                        }
                    },
                    {
                        $match: {
                            results: { $eq: [] } 
                        }
                    },
                    
                    {
                        $project: {
                            name: 1, 
                            date: 1, 
                            image: 1,
                            number_questions: 1 
                        }
                    },
                    {
                        $addFields: {
                            distinctUserCount: 0 
                        }
                    }
                ];
        
        const results_2 = await test_model.aggregate(select_no_certificate);


        const results_tests = results_1.concat(results_2);
        results_tests.sort((b, a) => a.distinctUserCount - b.distinctUserCount);


        return res.status(201).json({
            success: true,
            Successful: result_Suc.length,
            Unsuccessful: result_Uns.length,
            results_tests : results_tests
         
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}



module.exports.get_messages = async (req,res) => {
    try {

        const messages = await message_model.find({})
        .populate('id_user', 'name')            
        
        return res.status(201).json({
            success: true,
            messages: messages
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}




module.exports.get_top_6_country= async (req,res) => {
    try {
        user_model.aggregate([
   
            {
                $group: {
                    _id: '$country', // Group by country
                    count: { $sum: 1 } // Count users in each country
                }
            },
            {
                $sort: { count: -1 } // Sort by count in descending order
            },
            {
                $limit: 6 // Limit to top 6 countries
            },
            {
                $group: {
                    _id: null, // Group all documents together
                    topCountries: { $push: { country: '$_id', count: '$count' } }, // Store top countries and counts in an array
                    totalUsers: { $sum: '$count' } // Calculate the total count of users
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    topCountries: 1, // Include the topCountries field
                    totalUsers: 1 // Include the totalUsers field
                }
            }
        ], function(err, result) {
          if (err) {
            console.error(err);
          } else {

            result[0].topCountries.forEach(country => {
                country.percentage = (country.count * 100 / result[0].totalUsers).toFixed(2);
            });

            return res.status(202).json({
                success: true,
                topCountries: result[0].topCountries,
            })
          }
        });





    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}


