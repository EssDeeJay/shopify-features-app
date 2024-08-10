import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { Resend } from "resend";

export const loader = async ({request}: LoaderFunctionArgs) => {

    try {
        const { admin, session } = await authenticate.public.appProxy(request);
        if (session) {
          console.log('get route hit, return the below json data');
          const response = json({ success: true, message: 'Hey, its working !!', shopName: session.shop });
          return (response);
        }
      } catch (error) {
        console.error("Error in loader:", error);
      }
      return json({ success: false }, { status: 404 });
}

export const action = async ({request}: ActionFunctionArgs) => {
    const { session, admin } = await authenticate.public.appProxy(request);

    if(session){
        const { shop } = session;
        const response = await request.json();
        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log('--------Hit App Proxy---------');

        const emailHtml = `<div>${JSON.stringify(response)}</div>`;
        const { data, error } = await resend.emails.send({
          from: 'Red Ruby <onboarding@resend.dev>',
          to: ['hello@thesjdevelopment.com'],
          subject: 'Quote Data from Red Ruby App',
          html: emailHtml,
        });

        // here we can make a model to write the data to the mongodb as well and that way we can fetch it in another route and see
        // how many inquiries have been submitted so far.
        

        if (error) {
          return json({ error }, 400);
        }
        return json({success: true, submittedData: response, shopName: shop, dataSent: data});
    }
    return json({success: false});


}