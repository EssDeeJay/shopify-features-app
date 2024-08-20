import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs, ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Page, Layout, Card, BlockStack, Button, TextField } from "@shopify/polaris";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { slugify } from "~/utils/utils";

export const loader = async ({request}: LoaderFunctionArgs) => {
     await authenticate.admin(request);
     return null;
}

export const action = async ({request}: ActionFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);
    if(session){
        const response = await request.formData();
        const name = response.get('name') as string;
        const email = response.get('email');
        const message = response.get('message');

        const mutationResponse = await admin.graphql(`
           #graphql
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
          }
        `,
        {
          variables: {
            "metaobject": {
              "type": "request_quote",
              "handle": `${slugify(name)}`,
              "fields": [
                {
                  "key": "name",
                  "value": name
                },
                {
                  "key": "email",
                  "value": email
                },
                {
                  "key": "message",
                  "value": message
                }
              ]
            }
          }   
        }
      );

      const metaobjectResponse = await mutationResponse.json();

      if(metaobjectResponse.data.metaobjectCreate.userErrors.length){
        return json({success: false, errors: metaobjectResponse.data.metaobjectCreate.userErrors, errorMessage: 'Error in creating metaobject', submittedData: null});
      }
        return json({success: true, submittedData: metaobjectResponse, errorMessage: null});
    }

    return json({success: false, errorMessage: 'Session not found, request is not coming from valid shopify shop', submittedData: null });
}

export default function NewQuoteRequest(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const data = useActionData<typeof action>();
    const navigation = useNavigation();

const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
    },
    []
  );

const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
    },
    []
  );

const handleMessageChange = useCallback(
    (value: string) => {
      setMessage(value);
    },
    []
  );

  useEffect(() => {
    if (data?.success) {
      setName('');
      setEmail('');
      setMessage('');
      shopify.toast.show('Quote request submitted successfully!');
    }
  }, [data]);



    return(
        <Page title="New Quote Request" subtitle="Create a new quote request by filling up the form below." backAction={{url: '/app/quote-requests'}}>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack>
                            <Form method="post">
                                <div style={{ margin: '20px 0' }}>
                                   <TextField name="name" label="Name" autoComplete="off" value={name} onChange={handleNameChange} disabled={navigation.state === 'submitting'}/>
                                </div>
                                <div style={{ margin: '20px 0' }}>
                                  <TextField name="email" label="Email" autoComplete="off" value={email} onChange={handleEmailChange} disabled={navigation.state === 'submitting'}/>
                                </div>
                                <div style={{ margin: '20px 0' }}>
                                  <TextField name="message" label="Message" autoComplete="off" multiline={6} value={message} onChange={handleMessageChange} disabled={navigation.state === 'submitting'}/>
                                </div>                              
                                <div style={{ marginTop: '20px' }}>
                                  <Button submit variant="primary">
                                    {navigation.state === 'submitting' ? 'Submitting...' : 'Submit'}
                                  </Button>
                                </div>
                                                            
                            </Form>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}