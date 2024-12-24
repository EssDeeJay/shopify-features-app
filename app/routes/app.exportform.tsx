import React, { useCallback, useState } from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import { Page, Layout, Text, Card, Popover, Button } from "@shopify/polaris";
import CustomResourceList from "~/components/CustomResourceList";

export const action = ({request}: ActionFunctionArgs) => {
    return null;
}

export default function ExportForm(){
    const [activate, setActivate] = useState(false);

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
                            <CustomResourceList />
                        </Popover>
                    </div>
                </Card>
            </Layout.Section>
        </Layout>
    </Page>
   )
}