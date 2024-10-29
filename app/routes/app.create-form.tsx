import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, BlockStack, Card, Text, EmptyState } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return null;
}

export default function CreateForm() {
    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <Card>
                        <EmptyState
                            heading="Create a New Form"
                            action={{ content: 'Create Form', url: '/app/create-form/new' }}
                            image="https://cdn.shopify.com/shopifycloud/forms/bundles/673485334fd6933d971c75c05a87fb59dc33fac41750619592f3767509080c2a.svg"
                            fullWidth
                        >
                            <p>
                                You can create new form layout by clicking on the create form button. Once the layout are saved, you will be able to see them in action here and customize or delete them as you like.
                            </p>
                        </EmptyState>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}