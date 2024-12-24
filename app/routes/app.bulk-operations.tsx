import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, BlockStack, Card, Text, Button, Box } from "@shopify/polaris";
import { Link } from "@remix-run/react";
import CustomDropZone from "~/components/CustomDropZone";
import { Placeholder } from "~/components/Placeholder";
import CustomCalloutCard from "~/components/CustomCalloutCard";

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
}

export default function BulkOperations(){
    return(
        <Page>
            <ui-title-bar title="Bulk Operations"></ui-title-bar>
            <Layout>
                <Layout.Section>
                    <Card>
                        <Text as="h4" variant="headingMd">Export</Text>
                        <br/>
                        <Text as="h6">You will be able to export the bulk data from shopify.</Text>
                        <br/>
                        <Link to="/app/exportform">
                            <Button variant="primary">Export</Button>
                        </Link>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <Text as="h4" variant="headingMd">Import</Text>
                        <CustomDropZone />
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <Box borderRadius="100" background="bg-fill-info">
                            <Placeholder label="You have 0 scheduled jobs" />
                        </Box>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                     <Text as="h4" variant="headingMd">Help</Text>
                     <br/>
                     <CustomCalloutCard title={"Support"} illustration={""} primaryActionUrl={""} primaryActioncontent={"Contact Support"} 
                      children={"If you have any questions, do not hestitate to reach out, we will be glad helping you fix your issue."} />
                </Layout.Section>
            </Layout>
        </Page>
    )
}