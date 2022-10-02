const UtilisateurModel = require("./Utilisateur.model");
const nodemailer = require('nodemailer')



exports.validate =async(requete , reponse)=>{

    const user = await UtilisateurModel.findOne({ email: requete.body.email})
    if (user) {
        if(user.validation == 1){
            reponse.send({ msg: "Your account was already valid , try to connect",type:'info'})
        }else{
            if(user.verif_code == requete.body.verif_code){
            user.validation = 1;
            await user.save()
            reponse.send({ msg: "Suuccess account valid",type:'success'})
            }else{
                reponse.send({ msg: "check your code",type:'error'})
            }
        }
    } else {
        reponse.send({ msg: "erreur",type:'error'})

    }
}


exports.inscription =  async (requete, reponse) => {
    console.log(requete.body)

    const user = new UtilisateurModel(requete.body)
    const exist_email = await UtilisateurModel.findOne({ email: user.email })
    if (exist_email ) {
        reponse.send({ msg: "Email already used"  , type:'error'})

    } else {

        const exist_user = await UtilisateurModel.findOne({ name: user.name, tag: user.tag })
        if (exist_user) {
            reponse.send({ msg: "Name & tag already used" , type:'error' })
        } else {
            const verif_code = Math.floor(Math.random()*(999999-100000) +100000 )
            user.verif_code = verif_code
            user.validation = 0
            user.couverture=""
            await user.save();
            sendCodeVerification(user.email , verif_code,user.name,user.tag,"Verify your email")
            reponse.send({ msg: "Verification your email" , type:'info' })
        }

    }

}

exports.login =  async(requete , reponse)=>{

    const exist_user = await UtilisateurModel.findOne({ email: requete.body.email  , password : requete.body.password})
    if (exist_user) {
        if(exist_user.validation == 1){
            reponse.send({msg : 'Connecté' , user : exist_user , type:'success'})
        }else
        {   
            const verif_code1 = ( Math.floor(Math.random()*(999999-100000) +100000 ) ).toString()
            reponse.send({ msg:"Verification your email ",type: 'info' })
            exist_user.verif_code = verif_code1
            await exist_user.save();
            sendCodeVerification(exist_user.email , verif_code1,exist_user.name,exist_user.tag,"Verify your email")
        }

    } else {
        reponse.send({ msg: "erreur login" , type:'error'})

    }
}

function sendCodeVerification(email, verif_code,name,tag,msgg ) {
    //
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: 'mygcord@gmail.com',
            pass: 'enxuiydyeesprguc'
        },
        secure : true
        
    });
    var mailOptions = {
        from: 'mygcord',
        to: email,
        subject: 'Account Verification',
        text: 'welcome!',
        html: `
        <!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><title></title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width,initial-scale=1" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><style>
*{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}@media (max-width:660px){.desktop_hide table.icons-inner{display:inline-block!important}.icons-inner{text-align:center}.icons-inner td{margin:0 auto}.image_block img.big,.row-content{width:100%!important}.mobile_hide{display:none}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
</style></head><body style="background-color:#f8f8f9;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#f8f8f9" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#1aa19c" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;background-color:#1aa19c;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:0;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad">
<div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="divider_inner" style="font-size:1px;line-height:1px;border-top:4px solid #1aa19c"><span> </span></td></tr></table></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:5px;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="empty_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad"><div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff;color:#000;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:0;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%">
<tr><td class="pad" style="width:100%;padding-right:0;padding-left:0"><div align="center" class="alignment" style="line-height:10px"><form style="outline:none" tabindex="-1" target="_blank"><img class="big" src="https://media1.giphy.com/media/jSe6jtxh1N614a1IjC/giphy.gif?cid=790b76110503418342c06ad0df82e3e89abe853e7ad4b2e6&rid=giphy.gif&ct=g" style="display:block;height:auto;border:0;width:640px;max-width:100%" width="640"/></form></div></td>
</tr></table><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="padding-top:30px"><div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="divider_inner" style="font-size:1px;line-height:1px;border-top:0 solid #bbb"><span> </span>
</td></tr></table></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block block-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:Arial,sans-serif"><div class="" style="font-size:12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;mso-line-height-alt:14.399999999999999px;color:#555;line-height:1.2"><p style="margin:0;font-size:16px;text-align:center;mso-line-height-alt:19.2px"><strong><span style="font-size:28px;">${msgg}</span></strong></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block block-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:sans-serif"><div class="" style="font-size:12px;font-family:Montserrat,Trebuchet MS,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Tahoma,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:30px">
<span style="color:#808389;font-size:20px;">---- ${verif_code} ----</span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-5" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="padding-bottom:12px;padding-top:60px"><div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr>
<td class="divider_inner" style="font-size:1px;line-height:1px;border-top:0 solid #bbb"><span> </span></td></tr></table></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;background-color:#410125;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:0;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="text_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:sans-serif"><div class="" style="font-size:12px;font-family:Montserrat,Trebuchet MS,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Tahoma,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:33px">
<span style="font-size:22px;color:#e6e6e6;"><strong><span style="">${name} ${tag}</span></strong></span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="divider_block block-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:25px"><div align="center" class="alignment"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="divider_inner" style="font-size:1px;line-height:1px;border-top:1px solid #555961"><span> </span></td></tr></table></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block block-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:sans-serif"><div class="" style="font-size:12px;font-family:Montserrat,Trebuchet MS,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Tahoma,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:30px"><span style="font-size:20px;color:#cdc2cc;"><span style="">My-Gcord</span></span></p></div></div></td></tr></table></td>
</tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:640px" width="640"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:5px;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="icons_block block-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="pad" style="vertical-align:middle;color:#9d9d9d;font-family:inherit;font-size:15px;padding-bottom:5px;padding-top:5px;text-align:center">
<table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td class="alignment" style="vertical-align:middle;text-align:center"><!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]--><!--[if !vml]><!--><table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;display:inline-block;margin-right:-4px;padding-left:0;padding-right:0"><!--<![endif]--><tr><td style="vertical-align:middle;text-align:center;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:6px"><a href="https://www.designedwithbee.com/" style="text-decoration: none;" target="_blank"></table></td></tr></tbody></table><!-- End --></body></html>
        `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
         //   res.send({"error" : error})
        } else {
            console.log('Email sent: ' + info.response);
          //  res.send({"ok" : info.response})

        }
    });
}

exports.emailexist  =  async(requete , reponse)=>{

    const exist_user = await UtilisateurModel.findOne({ email: requete.body.email})
    if (exist_user) {
        reponse.send({ msg:"exist",type: 'info' })
    } else {
        reponse.send({ msg: "Email not exist" , type:'error'})
    }
}

exports.sendCode=  async(requete , reponse)=>{
    const user = await UtilisateurModel.findOne({ email: requete.body.email})
    if (user) {
        const verif_code1 = ( Math.floor(Math.random()*(999999-100000) +100000 ) ).toString()
        user.verif_code = verif_code1
        await user.save();
        sendCodeVerification(user.email , verif_code1,user.name,user.tag,requete.body.msgg)
    } 

    }


exports.savepassword  =  async(requete , reponse)=>{

    const user = await UtilisateurModel.findOne({ email: requete.body.email})
    if (user) {

        if( (user.verif_code == requete.body.verif_code) && (requete.body.password1 == requete.body.password2) )
        {
            user.validation = 1;
            user.password = requete.body.password1;
            await user.save()
            reponse.send({ msg:"password save",type:'success'}) 
        }else{
            if(user.verif_code != requete.body.verif_code){reponse.send({ msg:"check your code",type:'info'})}
            else{reponse.send({ msg:"check your password",type:'info'})}
        }
    } else {
        reponse.send({ msg: "error" , type:'error'})
    }
}

exports.Upcouverture=  async(requete , reponse)=>{
    const user = await UtilisateurModel.findOne({ email: requete.body.email})
    if (user) {
        user.couverture=requete.body.path;
        await user.save();
        reponse.send({ msg:"suuu", path:requete.body.path})
       
    } 
    else{
        reponse.send({ msg:"errer"})
    }

    }

    exports.getuser  =  async(requete , reponse)=>{

        const user = await UtilisateurModel.findOne({ email: requete.body.email})
        if (user) {
            reponse.send({
                name : user.name,
                tag :  user.tag,
                email :  user.email,
                password :  user.password,
                image :  user.image,
                couverture:  user.couverture,
                verif_code :  user.verif_code,
                validation :  user.validation})
        } 
    }


    exports.getall=  async(requete , reponse)=>{

        const result = await UtilisateurModel.find()
        reponse.send(result)
    }