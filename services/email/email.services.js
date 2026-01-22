const sgMail = require('@sendgrid/mail')
const verifyEmailTemplate = require('./templates/verify_email.js')
const { create_verification_code, delete_verification_code, get_verification_code } = require("../../db/email.js")

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

async function sendEmail({ to, subject, html }) {
  await sgMail.send({
    to,
    from: process.env.MAIL_SENDER,
    replyTo: process.env.MAIL_SENDER,
    subject,
    html
  })
}

async function send_verification_code(to) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  if(!to) {
    return {
      status: false,
      message: "Missing recipient",
      data: null
    }
  }

  const create_code = await create_verification_code({ code: code, email: to })

  if(create_code.status){
    await sendEmail( {
      to: to,
      subject: "Your verification code",
      text: `Your verification code is ${code}`,
      html: verifyEmailTemplate({
        code,
        appName: 'Scribo Blog',
        expiresInMinutes: 10
      })
    })
  }

  return create_code
}

async function verify_code(email, code) {
  if(!email) {
    return {
      status: false,
      message: "Missing email!",
      data: null
    }
  }
  if(!code) {
    return {
      status: false,
      message: "Missing code!",
      data: null
    }
  }

  const verification_code = await get_verification_code({ email: email })

  if(!verification_code.status) return verification_code

  if(verification_code.data.code === code) {
    return {
      status: true,
      message: "Success verified",
      data: {
        email: verification_code.data.email,
        code: verification_code.data.code
      }
    }
  }

  return {
    status: false,
    message: "Incorrect verification code!",
    data: null
  }

}

async function is_verification_code_exists(email) {
  return (await get_verification_code({ email: email })).status
}

async function invalidate_verification_code(email) {
  if(!email) {
    return {
      status: false,
      message: "Missing email",
      data: null
    }
  }
  const result = await delete_verification_code({ email: email })
  
  return result
}

module.exports = {
  send_verification_code,
  invalidate_verification_code,
  verify_code,
  is_verification_code_exists
}