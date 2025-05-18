import { ReactElement } from "react";
import { Resend } from 'resend';

export async function sendEmail({to,subject,reactElement}:{to:string,subject:string,reactElement:ReactElement}){
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("dkjfslkjfsklj",to,subject)
    try {
        const { data, error } = await resend.emails.send({
      from: 'Finance App <onboarding@resend.dev>',
      to,
      subject,
      react: reactElement,
      
    });
    if(data){
        
        console.log(data,"email sent")
        return {success:true,data};
    }
    } catch (error) {
        console.log("sending email error resend",error);
        throw error
    }
}