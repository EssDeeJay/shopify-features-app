import {
  Box,
  Card,
  Layout,
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
import { authenticate } from "~/shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useState, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";


export const loader = async ({request} : LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
}

export const action = async({request}: ActionFunctionArgs) => {
  const {admin} = await authenticate.admin(request);

  const formData = await request.formData();
  const tags = formData.get("tags");
  const products = formData.get("products");

  products && (products as string).split(",").forEach(async (product: string) => {
    // here we will write the graphql mutation to add the product tags for each product and once it completes the operation we will throw the success response.
    const tagsAddMutation = await admin.graphql(
      `#graphql
      mutation shopifyTagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node{
            id
          }
          userErrors {
            message
          }
        }
      }`,
    {
      variables: {
          id: product,
          tags: tags,
      },
    },
    );

    const tagsAddMutationJson = await tagsAddMutation.json();
    console.log(tagsAddMutationJson);

    // we will return the data here that we need to display to the users at the front end.
  })

  return json({
    data: tags
  })
}

export default function ProductFeatures() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [tagValue, setTagValue] = useState<string>('');
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

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

  const showTagModal = () => {
    shopify.modal.show("product-tags-modal");
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
      content: 'Add Product Tags',
      onAction: showTagModal
    }
  ]

  const addTags = () => {
    fetcher.submit({products: selectedProducts, tags: [tagValue] }, { method: "POST" })
    setTagValue('');
    setSelectedProducts([]);
    shopify.modal.hide("product-tags-modal");
    shopify.toast.show("Product Tags added successfully");
  };

  const handleTextFieldChange = useCallback(
    (value: string) => {
      setTagValue(value);
    },
    []
  );


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

        <Modal id="product-tags-modal">
             <div>
                <Box padding="400">                
                    <TextField label="Enter Tag Name" name="tags" autoComplete="off" helpText="Enter tags that you wanted to add to the selected products" id="tags-field" onChange={handleTextFieldChange} value={tagValue} placeholder="Enter Tag Names followed by comma" />          
                </Box>
             </div>
             <TitleBar title="Add Product Tags">
               <button variant="primary" onClick={addTags}>Add Tags</button>
               <button onClick={() => shopify.modal.hide("product-tags-modal")}>Cancel</button>
             </TitleBar>
        </Modal>
      </Layout>
    </Page>
  );
}
