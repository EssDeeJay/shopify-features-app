import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Page, Layout, BlockStack, Card, Text } from "@shopify/polaris";

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
}

export const action = async ({request}: ActionFunctionArgs) => {
    const { session, admin } = await authenticate.public.appProxy(request);

    if(session){
        const { shop } = session;
        console.log('--------Hit App Proxy---------');
        console.log(session);
        console.log('shop name is', shop);
        console.log('request data is', request.body);
        return session;
    }

    return null;
}

export default function ThemeAppExtensions(){
    return(
        <Page>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="300">
                            <h1>Theme App Extensions</h1>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}