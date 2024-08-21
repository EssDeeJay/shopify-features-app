import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, BlockStack, Card, Text } from "@shopify/polaris";

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
}

export default function OrderCancellations(){
    return(
        <Page>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="300">
                            <h1>Order cancellations</h1>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}