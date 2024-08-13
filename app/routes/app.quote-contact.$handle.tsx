import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, BlockStack, Text, InlineStack, ButtonGroup, Button } from "@shopify/polaris";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { EmailIcon, DeleteIcon } from '@shopify/polaris-icons';
import { json, redirect } from "@remix-run/node";
import { useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    try {
        const response = await admin.graphql(`
     #graphql
      query{
        metaobjectByHandle(handle: {type:"request_quote", handle: "${params.handle}"}){
          id
          handle
          updatedAt
          name: field(key: "name"){
            value
          }
          email: field(key: "email"){
            value
          }
          message: field(key: "message"){
            value
          }
        }
      }
    `);

        const data = await response.json();

        if (data.data.metaobjectByHandle) {
            return data.data.metaobjectByHandle;
        }

    } catch (error) {
        console.error('something went wrong', error);
    }

    return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {

  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const metafieldId = formData.get("id");

  if(metafieldId){
    const response = await admin.graphql(`
    #graphql
    mutation{
      metaobjectDelete(id: "${metafieldId}") {
        deletedId
        userErrors {
          field
          message
          code
        }
      }
    }
    `     
    );

    const data = await response.json();

    if(data.data.metaobjectDelete){
      return redirect('/app/quote-requests');
    }
    
    return json({message: 'failure to delete the metafield, please try again'});
  }
}

export default function QuoteRequestsByHandle() {

    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();
    
    const handleDeleteAction = () => {
        fetcher.submit({ handle: data.handle, id: data.id }, { method: 'POST' });
        fetcher.state === 'submitting' && shopify.toast.show('Deleting the Quote');
    }

    return (
        <Page title={`Quote Request - # ${data.name.value}`} backAction={{ content: 'Back to All Quotes', url: '/app/quote-requests'}}>
            <Layout>
                <Layout.Section>
                    <Card roundedAbove="sm">
                        <BlockStack gap="200">
                            <Text as="h4" variant="headingMd" fontWeight="bold">
                                Name
                            </Text>
                            <Text as="p" variant="bodyMd">
                                {data.name.value}
                            </Text>
                            <Text as="h4" variant="headingMd" fontWeight="bold">
                                Email
                            </Text>
                            <Text as="p" variant="bodyMd">
                                {data.email.value}
                            </Text>
                            <Text as="h4" variant="headingMd" fontWeight="bold">
                                Message
                            </Text>
                            <Text as="p" variant="bodyMd">
                                {data.message.value}
                            </Text>
                        </BlockStack>
                        <div style={{ paddingTop: '20px' }}>
                            <InlineStack align="end">
                                <ButtonGroup>
                                    <Button onClick={() => { }} accessibilityLabel="Email Customer" variant="primary" icon={EmailIcon}>
                                        Email Customer
                                    </Button>
                                    <Button
                                        icon={DeleteIcon}
                                        variant="primary"
                                        tone="critical"
                                        onClick={handleDeleteAction}
                                        accessibilityLabel="Delete Quote"
                                    >
                                        Delete Quote
                                    </Button>
                                </ButtonGroup>
                            </InlineStack>
                        </div>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}