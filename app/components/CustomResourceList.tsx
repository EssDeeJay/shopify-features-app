import React from "react";
import {Page, Layout, LegacyCard, ResourceList, ResourceItem, Text } from "@shopify/polaris";
import { ResourceListSelectedItems } from "@shopify/polaris/build/ts/src/utilities/resource-list";

export const itemsResource: CustomResourceItemProps[] = [
  {
    id: "products",
    title: "Products"
  },
  {
    id: "customers",
    title: "Customers"
  },
  {
    id: "orders",
    title: "Orders"
  }
];

interface CustomResourceItemProps{
  id: string;
  title: string;
}

interface CustomResourceListProps{
  items: CustomResourceItemProps[];
  selectedItems: ResourceListSelectedItems | undefined;
  setSelectedItems: 
     | ((selectedItems: ResourceListSelectedItems) => void)
     | undefined;
}

export default function CustomResourceList(props: CustomResourceListProps){
  const { items, selectedItems, setSelectedItems } = props;

  return (
    <LegacyCard>
        <ResourceList items={items} 
                      selectedItems={selectedItems} 
                      onSelectionChange={setSelectedItems} 
                      selectable
                      renderItem={(items) => {
                        const {id, title} = items;
                        return (
                          <ResourceItem id={id} onClick={(id) => console.log(id, 'resource item')} name={title}>
                            <Text as="h3" variant="bodyMd" fontWeight="bold">
                                {title}
                            </Text>
                          </ResourceItem>
                        )
                      }}>

        </ResourceList>
    </LegacyCard>
  )
}