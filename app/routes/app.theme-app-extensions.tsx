import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { slugify } from "~/utils/utils";

export const loader = async ({request}: LoaderFunctionArgs) => {

    try {
        const { admin, session } = await authenticate.public.appProxy(request);
        if (session) {
          console.log('get route hit, return the below json data');
          const response = json({ success: true, message: 'Nothing here mate, nice try !!', shopName: session.shop });
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
        console.log('--------Hit App Proxy---------');

        const metafieldCreate = await admin.graphql(
          `#graphql
          mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
              metaobject {
                handle
                name: field(key: "name") {
                  value
                }
                email: field(key: "email") {
                  value
                }
                message: field(key: "message") {
                  value
                }
              }
              userErrors {
                field
                message
                code
              }
            }
          }`,
          {
            variables: {
              "metaobject": {
                "type": "request_quote",
                "handle": `${slugify(response.name)}`,
                "fields": [
                  {
                    "key": "name",
                    "value": `${response.name}`
                  },
                  {
                    "key": "email",
                    "value": `${response.email}`
                  },
                  {
                    "key": "message",
                    "value": `${response.message}`
                  }
                ]
              }
            },
          },
        );

      const flowTriggerMutation = await admin.graphql(`
          #graphql
          mutation flowTriggerReceive($handle: String, $payload: JSON) {
            flowTriggerReceive(handle: $handle, payload: $payload) {
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          variables: {
            "handle": "request-quote-form-submit",
            "payload": {
              "name": `${response.name}`,
              "email": `${response.email}`,
              "message": `${response.message}`
            }
          }
        }
      );
        
        const metafieldResponse = await metafieldCreate.json();

        const flowResponse = await flowTriggerMutation.json();
        
        if(metafieldResponse.data.metaobjectCreate.userErrors.length && flowResponse.data.flowTriggerReceive.userErrors.length){
          return json({success: false, errors: metafieldResponse.data.metaobjectCreate.userErrors});
        }
      
        return json({success: true, submittedData: response, shopName: shop, metafieldResponse: metafieldResponse, flowSuccess: true});
    }

    return json({success: false, errorMessage: 'Session not found, request is not coming from valid shopify shop'});
}