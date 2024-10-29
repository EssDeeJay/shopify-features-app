import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs, ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Page, Layout, Card, BlockStack, Button, TextField, Text, Box, InlineGrid, InlineStack, ButtonGroup } from "@shopify/polaris";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { PlusIcon } from "@shopify/polaris-icons";
import { useState } from "react";

export default function NewQuoteRequest() {
    const navigation = useNavigation();

    return (
        <Page title="New Form" subtitle="Create a new form below." backAction={{ url: '/app/create-form' }}>
            <Layout>
                <Layout.Section>
                    <Card roundedAbove="sm">
                        <BlockStack gap="200">
                            <InlineGrid columns="1fr auto">
                                <Text as="h2" variant="headingSm">
                                    Create New Form
                                </Text>
                                <Button
                                    onClick={() => { }}
                                    accessibilityLabel="Add variant"
                                    icon={PlusIcon}
                                    variant="primary"
                                >
                                    Add Field
                                </Button>
                            </InlineGrid>
                            <Text as="p" variant="bodyMd">
                                Click add field to add new fields to the form and also see the generated preview of the form on how it looks.
                            </Text>
                        </BlockStack>
                        <InlineStack align="end">
                            <ButtonGroup>
                                <Button onClick={() => { }} accessibilityLabel="Cancel" variant="secondary">
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => { }}
                                    accessibilityLabel="Create"
                                >
                                    Create
                                </Button>
                            </ButtonGroup>
                        </InlineStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card roundedAbove="sm">
                        <BlockStack>
                            Live Preview Section
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}