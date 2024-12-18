
const user_model = require("../models/user.model");
const test_model = require("../models/test.model");
const question_model = require("../models/question.model");
const result_model = require("../models/result.model");
const message_model = require("../models/message_.model");
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
 


module.exports.create_user = async (req,res) => {
    try {

        let icon ="info"
        let title = "Email used"
        const exist_user = await user_model.findOne({ email: req.body.email  })


        if( !exist_user ){
            
            if(email_valide(req.body.email)){

                let date = new Date();
                const user = new user_model(req.body)
               
                user.date.year = date.getFullYear()
                user.date.month = (date.getMonth() + 1)
                user.date.day = date.getDate()

                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password,salt);


                await user.save();
                icon ="success"
                title = "Your account has been created"
            }
            else{
                icon ="error"
                title = "Please enter a valid email"
            }

        }


        return res.status(201).json({
            success: true,
            icon: icon,
            title: title

        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}






  module.exports.send_recovery_code = async (req,res) => {
    try {
   
        let icon ="error"
        let title = "Sorry, we don't recognize this email"
        const exist_user = await user_model.findOne({ email: req.body.email  })

        if( exist_user ){
            
                const code = ( Math.floor(Math.random()*(999999-100000) +100000 ) ).toString()

                const salt = await bcrypt.genSalt(10);
                exist_user.recovery_code = await bcrypt.hash(code,salt);
                await exist_user.save();
    
                sendCodeVerification(exist_user.email , code ,  exist_user.name ,"Reset password")

                icon ="info"
                title = "We'll send you a code to your email"   
        }


        return res.status(202).json({
            success: true,
            icon: icon,
            title: title

        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}





module.exports.reset = async (req,res) => {
    try {
   
        let icon ="info"
        let title = "The code you entered doesn’t match"
        const exist_user = await user_model.findOne({ email: req.body.email  })

        let compare = await bcrypt.compare(req.body.recovery_code,exist_user.recovery_code)

        if( compare ){
            
                const salt = await bcrypt.genSalt(10);
                exist_user.password =  await bcrypt.hash(req.body.password,salt);
                await exist_user.save();

                icon ="success"
                title = "Your password has been changed"   
        }


        return res.status(202).json({
            success: true,
            icon: icon,
            title: title

        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}









module.exports.login = async (req,res) => {
    try {
   
        let icon ="info"
        let title = "Incorrect password"


        const exist_user = await user_model.findOne({ email: req.body.email  })

        if( exist_user ){
        let compare = await bcrypt.compare(req.body.password,exist_user.password)

        if( compare ){
            
                icon ="success"
                title = "Welcome "+exist_user.name;   
        }
        }
        

        return res.status(202).json({
            success: true,
            id: exist_user._id,
            icon: icon,
            title: title

        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}




module.exports.get_user = async (req,res) => {
    try {
   
        const user = await user_model.findOne({ _id: req.body.id  })
        return res.status(202).json({
            success: true,
            name: user.name
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}












module.exports.get_tests = async (req,res) => {
    try {
   
        const tests = await test_model.find()
        return res.status(202).json({
            success: true,
            tests: tests.reverse()
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}



module.exports.get_questions= async (req,res) => {
    try {
        test_model.aggregate([
          {

            $match: { 
                    $expr : {
                         $eq: [ '$_id' , { $toObjectId: req.body.id } ] 
                            }
                    }  
          },
          {
            $lookup: {
              from: 'questions',  
              localField: '_id',
              foreignField: 'test_refers',
              as: 'Dataquestions'
            }
          },
          {
            $project: {
                _id: 0,
                name: 1,
                number_questions: 1,
                image: 1,
                content: 1,
                time: 1,
                date: 1,
               
              questions: {
                $map: {
                  input: '$Dataquestions',
                  as: 'the_question',
                  in: {
                    question: '$$the_question.question',
                    A_answer: '$$the_question.A_answer',
                    B_answer: '$$the_question.B_answer',
                    C_answer: '$$the_question.C_answer',
                    D_answer: '$$the_question.D_answer'
                  }
                }
              }
            }
          }
        ], function(err, result) {
          if (err) {
            console.error(err);
          } else {
            return res.status(202).json({
                success: true,
                res: result[0]
            })
          }
        });





    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}


module.exports.valide_test = async (req,res) => {
    try {
   
        const questions = await question_model.find({test_refers : req.body.id_test})
        let r= "Unsuccessful"
        let i=0
        let c=0

        for(let q of questions){
            if(req.body.tab_correct_answer[i] == q.correct_answer)
            c++
            i++
        }
        c= Math.round( (c*100)/i )
        if( c >= 80)
            r= "Successful"
        c=c+"%"
        let date = new Date();
        const result = new result_model()
        result.date.year = date.getFullYear()
        result.date.month = (date.getMonth() + 1)
        result.date.day = date.getDate()
        result.id_user= req.body.id_user
        result.id_test= req.body.id_test
        result.percentage=c
        result.result=r



        await result.save();


        return res.status(202).json({
            success: true,
            percentage: c,
            result: r,


        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }
}






module.exports.get_tests = async (req,res) => {
    try {
   
        let tests = await test_model.find()
        return res.status(202).json({
            success: true,
            tests: tests.reverse()
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}



module.exports.get_career= async (req,res) => {
    try {

        result_model.aggregate([
          {

            $match: { 
                    $expr : {
                         $eq: [ '$id_user' , { $toObjectId:req.body.id_user } ] 
                            }
                    }  
          },
          {
            $lookup: {

                from: 'tests', 
                localField: 'id_test',
                foreignField: '_id',
                as: 'test'
            }
          },
          {
            $unwind: '$test'
          },
          {
            $project: {
                _id: 0,
                'test.name': 1,
                'percentage': 1,
                'result': 1,
                'date': 1
            }
          }
        ], function(err, result) {
          if (err) {
            console.error(err);
          } else {
            return res.status(202).json({
                success: true,
                career: result
            })
          }
        });





    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}







module.exports.get_certif = async (req,res) => {
    try {

        let certifications= []
        let my_res = await result_model.distinct('id_test',{result:'Successful' , id_user: req.body.id_user }  )

        let i=0
        for(let c of my_res){
            
            test = await test_model.findOne({_id : c })
            certifications[i]={}
            certifications[i].name = test.name
            certifications[i].id_test = test._id
            i++
        }

        return res.status(202).json({
            success: true,
            certifications: certifications
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}




module.exports.details_certification = async (req,res) => {
    try {

        user = await user_model.findOne({_id : req.body.id_user })
        test = await test_model.findOne({_id : req.body.id_test })

        return res.status(202).json({
            success: true,
            name_user: user.name,
            name_test: test.name,
        })

    }catch(error) {
        return res.status(400).json({
            success:false

        })
    }

}




module.exports.send_message = async (req,res) => {
    try {

        if( req.body.message  ){
            
            const message = new message_model(req.body)
            await message.save();

        } 


        return res.status(201).json({
            success: true
        })

    }catch(error) {
        return res.status(400).json({
            success:false
        })
    }

}


































































function email_valide(email) {

    let pattern=/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
    let result = pattern.test(email);

    return result
}

function sendCodeVerification(email, recovery_code , name , msg ) {
    //
    u="http://localhost:3000/images/notf.png"
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: 'arena1clubs@gmail.com',
            pass: 'oaaoplcoilhjabtp'
            
        },
        secure : true
    });
    var mailOptions = {
        from: 'Digital city',
        to: email,
        subject: msg,
        text: 'welcome!',
        html: `
        <!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><title></title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width,initial-scale=1" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><style>
*{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}@media (max-width:660px){.desktop_hide table.icons-inner{display:inline-block!important}.icons-inner{text-align:center}.icons-inner td{margin:0 auto}.image_block img.big,.row-content{width:100%!important}.mobile_hide{display:none}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
</style></head><body style="background-color:#f8f8f9;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#f8f8f9" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#1aa19c" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;background-color:#1aa19c;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:0;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad">
<div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="divider_inner" style="font-size:1px;line-height:1px;border-top:4px solid #1aa19c"><span> </span></td></tr></table></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:5px;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="empty_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad"><div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff;color:#000;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:0;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%">
<tr><td class="pad" style="width:100%;padding-right:0;padding-left:0"><div align="center" class="alignment" style="line-height:10px"><form style="outline:none" tabindex="-1" target="_blank"><img class="big" src="https://media1.giphy.com/media/jSe6jtxh1N614a1IjC/giphy.gif?cid=790b76110503418342c06ad0df82e3e89abe853e7ad4b2e6&rid=giphy.gif&ct=g" style="display:block;height:auto;border:0;width:640px;max-width:100%" width="640"/></form></div></td>
</tr></table><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="padding-top:30px"><div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="divider_inner" style="font-size:1px;line-height:1px;border-top:0 solid #bbb"><span> </span>
</td></tr></table></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block block-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:Arial,sans-serif"><div class="" style="font-size:12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;mso-line-height-alt:14.399999999999999px;color:#555;line-height:1.2"><p style="margin:0;font-size:16px;text-align:center;mso-line-height-alt:19.2px"><strong><span style="font-size:28px;">${msg}</span></strong></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block block-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:sans-serif"><div class="" style="font-size:12px;font-family:Montserrat,Trebuchet MS,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Tahoma,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:30px">
<span style="color:#808389;font-size:20px;">---- ${recovery_code} ----</span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-5" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="padding-bottom:12px;padding-top:60px"><div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr>
<td class="divider_inner" style="font-size:1px;line-height:1px;border-top:0 solid #bbb"><span> </span></td></tr></table></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;background-color:#410125;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:0;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="text_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:sans-serif"><div class="" style="font-size:12px;font-family:Montserrat,Trebuchet MS,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Tahoma,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:33px">
<span style="font-size:22px;color:#e6e6e6;"><strong><span style="">${name}</span></strong></span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:25px"><div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="divider_inner" style="font-size:1px;line-height:1px;border-top:1px solid #555961"><span> </span></td></tr></table></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block block-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:sans-serif"><div class="" style="font-size:12px;font-family:Montserrat,Trebuchet MS,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Tahoma,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:30px"><span style="font-size:20px;color:#cdc2cc;"><span style="">Digital city</span></span></p></div></div></td></tr></table></td>
</tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:5px;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="icons_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="vertical-align:middle;color:#9d9d9d;font-family:inherit;font-size:15px;padding-bottom:5px;padding-top:5px;text-align:center">
<table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="alignment" style="vertical-align:middle;text-align:center"><!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]--><!--[if !vml]><!--><table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;display:inline-block;margin-right:-4px;padding-left:0;padding-right:0"><!--<![endif]--><tr><td style="vertical-align:middle;text-align:center;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:6px"><a href="https://www.designedwithbee.com/" style="text-decoration: none;" target="_blank"></table></td></tr></tbody></table><!-- End --></body></html>
        `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);

        }
    });
}