import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  EmptyState,
  ResourceList,
  ResourceItem, 
  InlineStack,
  Tag,
  TextField
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "~/shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";


export const loader = async ({request} : LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
}

export default function AdditionalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const handleProductSelection = (selectedProducts: any[]) => {
    setSelectedProducts(selectedProducts);
  }

  const openResourcePicker = () => {
    shopify.resourcePicker({type: "product", multiple: true })
    .then((products) => {
      if(products !== undefined){
        setProducts(products);
      }
    })
    .catch((error) => {
      console.log(error);
    })
  }

  const emptyStateMarkup = !products.length ? (
    <EmptyState
       heading="No Products Selected"
       action={{
        content: "Select Products",
        onAction: openResourcePicker
       }}
       image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        Please select the products first to see the available operations for the
        selected products.
      </p>
    </EmptyState>
  ) : undefined;

  const removeSelectedProducts = () => {
    const newProducts = products.filter((product) => {
      return !selectedProducts.includes(product.id);
    });
    setProducts(newProducts);
    setSelectedProducts([]);
  }

  const bulkActions = [
    {
      content: "Remove Selected",
      destructive: true,
      onAction: removeSelectedProducts
    }
  ];

  const promotedActions = [
    {
      content: 'Add Product Tags'
    },
    {
      content: 'Remove Product Tags',
      destructive: true
    }
  ]

  return (
    <Page>
      <TitleBar title="Product Selector" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <ResourceList
                 resourceName={{ singular: "Product", plural: "Products" }}
                 items={products}
                 emptyState={emptyStateMarkup}
                 renderItem={(item : any) => {
                  const { id, title, images, tags } = item;
                  return(
                    <ResourceItem
                       id={id}
                       accessibilityLabel={`View Details for ${title}`}
                       key={id}
                       media={
                        images[0] && (
                          <img src={images[0].originalSrc} alt={title} height={50} width={50} />
                        )
                       }
                       verticalAlignment="center"
                       onClick={() => { console.log('resource product selected with the id of', id)}}
                    >
                      <Text variant="bodyMd" fontWeight="semibold" as="h3">
                        {title}
                      </Text>
                      <InlineStack gap="200" blockAlign="center">
                        {tags.map((tag: String) => (
                          <Tag key={`${tag}`}>{tag}</Tag>
                        ))}
                      </InlineStack>
                    </ResourceItem>
                  )
                 }}
                 onSelectionChange={handleProductSelection}
                 selectedItems={selectedProducts}
                 bulkActions={bulkActions}
                 promotedBulkActions={promotedActions}
                />
            </BlockStack>
          </Card>
        </Layout.Section>

        <ui-modal id="product-tags-modal">
             <div>
                <Box padding="400">
                  <Text as="h2" variant="headingMd">
                    Product Tags
                  </Text>
                  <TextField label="Enter Tag Name" name="tags" autoComplete="off" helpText="Enter tags that you wanted to add to the selected products" /> 
                </Box>
             </div>
             <ui-title-bar title="Add Product Tags">
               <button variant="primary">Add Tags</button>
               <button onClick={() => document?.getElementById("product-tags-modal").hide()}>Cancel</button>
             </ui-title-bar>
        </ui-modal>
      </Layout>
    </Page>
  );
}
