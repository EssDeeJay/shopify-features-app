import { authenticate } from "~/shopify.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader = async({request}: LoaderFunctionArgs) => {

    return json({ data: 'From red ruby app' });
}

export const action = async ({request}: ActionFunctionArgs) =>{

    const { session, admin, sessionToken } = await authenticate.admin(request);

    if(session){
      console.log(request);
      return null;
    }

    return null;
}