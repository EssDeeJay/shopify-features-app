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
import { getShopSession } from "~/models/ProductOperations.server";


export const loader = async ({request} : LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  const shopQuery = await admin.graphql(
    `#graphql
    query {
      shop {
        name
        url
      }
    } `
  );
  const shopName = await shopQuery.json();
  const shop = shopName.data.shop.url.split("/")[2];
  
  const session = await getShopSession(shop);

  /*
   1. Get the products that was selected before by the user, if they have deleted it render empty markup
   2. If products exist, return them as json and render them on the app page
  */
  return null;
}

export const action = async({request}: ActionFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  const formData = await request.formData();
  const tags = formData.get("tags");
  const products = formData.get("products");
  const removeProducts = formData.get("removeTagProducts");
  const tagsRemove = formData.get("tagsRemove");

  products && (products as string).split(",").forEach(async (product: string) => { 
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
          tags: (tags as string).split(","),
      },
    },
    );

    const tagsAddMutationJson = await tagsAddMutation.json();
    return tagsAddMutationJson;
  });
  
  removeProducts && (removeProducts as string).split(",").forEach(async (removeProduct: string) => {

    const tagsRemoveMutation = await admin.graphql(
      `#graphql
      mutation shopifyTagsRemove($id: ID!, $tags: [String!]!) {
        tagsRemove(id: $id, tags: $tags) {
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
          id: removeProduct,
          tags: (tagsRemove as string).split(","),
      }
    }
    );

    const tagsRemoveMutationJson = await tagsRemoveMutation.json();
    return tagsRemoveMutationJson;
  })

  return json({
     tagsAdd: tags ? tags : null,
     tagsRemove: tagsRemove ? tagsRemove : null
  })
}

export default function ProductFeatures() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [tagValue, setTagValue] = useState<string>('');
  const [tagRemoveValue, setTagRemoveValue] = useState<string>('');
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
    // update the database, remove the products from the database
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
      content: 'Create Product Bundle',
      onAction: () => alert("Create Product Bundle")
    },
    {
      content: 'Add Product Tags',
      onAction: () => shopify.modal.show("product-add-modal")
    },
    {
      content: 'Remove Product Tags',
      destructive: true,
      onAction: () => shopify.modal.show("product-remove-modal")
    },
  ]

  const addTags = () => {
    fetcher.submit({products: selectedProducts, tags: [tagValue] }, { method: "POST" })
    setTagValue('');
    setSelectedProducts([]);
    shopify.modal.hide("product-add-modal");
    shopify.toast.show("Tags Added Successfully");
  };

  const removeTags = () => {
    fetcher.submit({ removeTagProducts: selectedProducts, tagsRemove: [tagRemoveValue] }, { method: "POST"});
    setTagRemoveValue('');
    setSelectedProducts([]);
    shopify.modal.hide("product-remove-modal");
    shopify.toast.show("Tags Removed Successfully");
  }

  const handleTextFieldChange = useCallback(
    (value: string) => {
      setTagValue(value);
    },
    []
  );

  const handleRemoveFieldChange = useCallback(
    (value: string) => {
      setTagRemoveValue(value);
    },
    []
  );

  const handleSeparateRemove = async (id: string, tag: string) => {
     fetcher.submit({ removeTagProducts: [id], tagsRemove: [tag]}, {method: "POST"});
     shopify.toast.show(`${tag} Tag Removed Successfully, It will be gone when window reloads`);
  }


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
                       onClick={() => {}}
                    >
                      <Text variant="bodyMd" fontWeight="semibold" as="h3">
                        {title}
                      </Text>
                      <InlineStack gap="200" blockAlign="center">
                        {tags.map((tag: string) => (
                          <Tag key={`${tag}`} onRemove={() => handleSeparateRemove(id, tag)}>{tag}</Tag>
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

        <Modal id="product-add-modal">
             <div>
                <Box padding="400">                
                    <TextField label="Enter Tag Name" name="tags" autoComplete="off" helpText="Enter tags that you wanted to add to the selected products" id="tags-field" onChange={handleTextFieldChange} value={tagValue} placeholder="Enter Tag Names followed by comma" />          
                </Box>
             </div>
             <TitleBar title="Add Product Tags">
               <button variant="primary" onClick={addTags}>Add Tags</button>
               <button onClick={() => shopify.modal.hide("product-add-modal")}>Cancel</button>
             </TitleBar>
        </Modal>

        <Modal id="product-remove-modal">
           <div>
              <Box padding="400">
                <TextField label="Enter Tag Name" name="tagsRemove" autoComplete="off" helpText="Enter tags that you want to remove from the selected products.Only the tags that match on the products gets removed, other tags will be ignored." id="tags-remove" placeholder="Enter Tag Names followed by comma" value={tagRemoveValue}  onChange={handleRemoveFieldChange} />
              </Box>
           </div>
           <TitleBar title="Remove Product Tags">
               <button variant="primary" onClick={removeTags}>Remove Tags</button>
               <button onClick={() => shopify.modal.hide("product-remove-modal")}>Cancel</button>
           </TitleBar>
        </Modal>
      </Layout>
    </Page>
  );
}
