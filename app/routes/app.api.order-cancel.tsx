import { authenticate, unauthenticated } from "~/shopify.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { headers } from "./app";

export const loader = async({request}: LoaderFunctionArgs) => {

    return json({ data: 'From red ruby app' });
}

export const action = async ({request}: ActionFunctionArgs) =>{

    const { sessionToken } = await authenticate.public.checkout(request);
    const { admin } = await unauthenticated.admin(sessionToken.dest);

    const data = await request.json();

   if(sessionToken){

    try{
      const response = await admin.graphql(`
       #graphql
       mutation OrderCancel($orderId: ID!, $notifyCustomer: Boolean, $refund: Boolean!, $restock: Boolean!, $reason: OrderCancelReason!, $staffNote: String) {
        orderCancel(orderId: $orderId, notifyCustomer: $notifyCustomer, refund: $refund, restock: $restock, reason: $reason, staffNote: $staffNote) {
          job {
            id
            done
          }
          orderCancelUserErrors {
            field
            message
            code
          }
        }
       }
      `, {
        variables: {         
            "orderId": data.orderId,
            "notifyCustomer": true,
            "refund": true,
            "restock": true,
            "reason": "CUSTOMER",
            "staffNote": "Cancelled from the order status page." 
        }
      });

      const responseJson = await response.json();
      
      return json({success: true, responseJson: responseJson }, {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })

    }catch(error){
      console.error(error);
      return json({success: false, error: error }, { headers: {
        'Access-Control-Allow-Origin': '*'
      }});
    }
   }
  
    return json({
       success: null,
       message: 'something is off here !'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });   
}