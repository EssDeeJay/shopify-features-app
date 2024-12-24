import React, { useCallback, useState } from "react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Page, Layout, Text, Card, Popover, Button, ResourceListProps } from "@shopify/polaris";
import CustomResourceList, { itemsResource } from "~/components/CustomResourceList";
import { authenticate } from "~/shopify.server";
import { productsQuery } from "~/graphql/bulkQuery";

export const action = async ({request}: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    const formData = await request.formData();

    const response = await admin.graphql(`
    #graphQl
      mutation{
        bulkOperationRunQuery(
            query: """
              ${productsQuery}
            """
        ){
            bulkOperation{
                id
                status
                query
                url
                rootObjectCount
                type
                createdAt
                fileSize
                partialDataUrl
                objectCount
            }
            userError{
                field
                message
            }
        }
      }
    `);

    if(response.ok){
        const data = await response.json();
        console.log('data', data);
    }
    return null;
}

export default function ExportForm(){
    const [activate, setActivate] = useState(false);
    const [selectedItems, setSelectedItems] = useState<ResourceListProps["selectedItems"]>([]);

    const toggleActive = useCallback(() => {
        setActivate(prev => !prev);
    }, []);

    const activator = (
        <Button onClick={toggleActive} disclosure>
            Select Sheets
        </Button>
    );

   return(
    <Page>
        <ui-title-bar title="New Export">
            <button variant="breadcrumb">Home</button>
            <button onClick={() => {}}>Back</button>
            <button onClick={() => {}} variant="primary">Export</button>
        </ui-title-bar>
        <Layout>
            <Layout.Section>
                <Card>
                    <Text as="p" fontWeight="bold">Format: CSV</Text>
                </Card>
                <br/>
                <Card>
                    <div style={{ position: "relative" }}>
                        <Popover active={activate} activator={activator} onClose={toggleActive} fullWidth autofocusTarget="first-node">
                            <CustomResourceList items={itemsResource} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
                        </Popover>
                    </div>
                </Card>
            </Layout.Section>
        </Layout>
    </Page>
   )
}