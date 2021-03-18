const sgMail =require('@sendgrid/mail')

 sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendResetPasswordLink = ( email, link ) => {
    sgMail.send({
        to:email,
        from:process.env.EMAIL,
        subject:"Password Reset",
        html:`<h2>Please click on the given link to reset your password!</h2>
       <a href="${link}">Click me to reset your password!</a>`
    })
   
}

 module.exports = {　sendResetPasswordLink }
     