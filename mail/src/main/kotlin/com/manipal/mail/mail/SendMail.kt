package com.manipal.mail.mail


import es.atrujillo.mjml.service.auth.MjmlAuth
import es.atrujillo.mjml.service.auth.MjmlAuthFactory
import es.atrujillo.mjml.service.definition.MjmlService
import es.atrujillo.mjml.service.impl.MjmlRestService
import javax.mail.*
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage


class SendMail {
    fun sendMail(to: String, subjects: String, messages: String) {
        Transport.send(plainMail(to, subjects, mjml(messages)))
        //print("im done")
    }
    private fun mjml(mjmlTemplate: String):String{
        //println("mjml function")
        val memoryAuthConf: MjmlAuth = MjmlAuthFactory.builder()
                .withMemoryCredentials()
                .mjmlCredentials("c49481d5-fe08-4819-bab8-26db50b9d01a", "dc2f0033-679d-4fb6-9dc6-5784bd5d6f2c")
                .build()

        val mjmlService: MjmlService = MjmlRestService(memoryAuthConf)

        val htmlData=mjmlService.transpileMjmlToHtml(mjmlTemplate)
        println(htmlData)
        return htmlData
    }

    private fun plainMail(to: String, subjects: String, messages: String): MimeMessage {
        print("plian")
        val tos = arrayListOf(to) //Multiple recipients
        val from ="ibazaar40@gmail.com" //Sender email
        val password="ngywfns67"
        val encryption: Encryption =Encryption()
        val properties = System.getProperties()

        with(properties) {
            put("mail.smtp.host", "smtp.gmail.com");
            put("mail.smtp.port", "465");
            put("mail.smtp.auth", "true");
            put("mail.smtp.socketFactory.port", "465");
            put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        }

        val auth = object : Authenticator() {
            override fun getPasswordAuthentication() =
                    PasswordAuthentication(from, encryption.decrypt(password)) //Credentials of the sender email
        }

        val session = Session.getDefaultInstance(properties, auth)

        val message = MimeMessage(session)

        with(message) {
            setFrom(InternetAddress(from))
            for (to in tos) {
                addRecipient(Message.RecipientType.TO, InternetAddress(to))
                subject = subjects //Email subject
                setContent(messages, "text/html; charset=utf-8") //Sending html message, you may change to send text here.
            }
        }
        //print("message")
        return message
    }
}

fun main() {
    var sendMail=SendMail()
    sendMail.sendMail("rashwinnonda@gmail.com","qwe","qaseer")
}