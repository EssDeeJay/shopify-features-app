import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Page, Layout, Card, BlockStack, DataTable, Link, Button } from "@shopify/polaris";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
   #graphql
     query{
        metaobjects(type:"request_quote", first: 25, sortKey:"updated_at"){
            edges{
              cursor
              node{
                handle
                updatedAt
                name:field(key:"name"){
                  value
                }
                email:field(key:"email"){
                  value
                }
                message:field(key:"message"){
                  value
                }
              }    
            }
            pageInfo{
              hasNextPage
              endCursor
            }
        }
     }
  `);

  const data = await response.json();

  if(data.data.metaobjects){
    return data.data.metaobjects;
  }

  return null;
}

export default function QuoteRequests(){
    const quoteRequests: any = useLoaderData();

    const rows = quoteRequests.edges.map((quote: any) => {
       let link = `/app/quote-contact/${quote.node.handle}`;
        return [
           <Link url={link} removeUnderline>{quote.node.name.value}</Link>,
           quote.node.email.value,
           quote.node.message.value
        ];
    });

    return(
        <Page title="Quote Requests" subtitle="Quote requests from the shopify storefront" primaryAction={<Button variant="primary" url="/app/quote-requests/new">Create New Quote</Button>}>
          <Layout>
             <Layout.Section>
                 <Card>
                    <BlockStack gap="300">
                        <DataTable
                            headings={[
                              'Name',
                              'Email',
                              'Message'
                            ]}
                            columnContentTypes={[
                              'text',
                              'text',
                              'text'
                            ]}
                            rows={rows}
                            pagination={{
                              hasNext: true,
                              onNext: () => {}
                            }}
                            />
                    </BlockStack>
                 </Card>
             </Layout.Section>
          </Layout>
        </Page>
    )
}