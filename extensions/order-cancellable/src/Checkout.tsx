import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useTranslate,
  Button,
  useStorage,
  useOrder
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect, useCallback } from "react";

export const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => (
  <ThankYouBlock />
));

export const orderStatusBlock = reactExtension("customer-account.order-status.block.render", () => (
  <OrderStatusBlock />
));

function ThankYouBlock() {
  const translate = useTranslate();
  const { extension } = useApi();
  const [attribution, setAttribution] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useStorageState('order-submitted');


  async function handleSubmit(){
    console.log('cancel order button clicked');
  }

  if(orderSubmitted.loading || orderSubmitted.data === true){
    return null;
  }

  return (
    <BlockStack>
      <Button appearance="critical" onPress={handleSubmit}>
         {translate("cancelButton")}
      </Button>
    </BlockStack>
  );
}

function OrderStatusBlock(){
  const translate = useTranslate();
  const { extension } = useApi();
  const order = useOrder();

  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useStorageState('order-submitted');


  async function handleSubmit(){
    console.log('cancel order button clicked');
    //simulate the server request here
    const response = await fetch('https://reflected-stocks-flowers-timer.trycloudflare.com/app/api/order-cancel', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      },
    });
    const apiResponse = await response.json();
    console.log(apiResponse);
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // send the order to the server for cancellation with the refund and restock
        console.log('Order Submitted:', order.id);
        setLoading(false)
        setOrderSubmitted(true);
        resolve(true);
      }, 2000);
    });

  }

  if(orderSubmitted.loading || orderSubmitted.data === true || !order){
    return null;
  }

  return (
    <BlockStack>
      <Button appearance="critical" onPress={handleSubmit} loading={loading}>
         {translate("cancelButton")}
      </Button>
    </BlockStack>
  );
}

function useStorageState(key) {
  const storage = useStorage();
  const [data, setData] = useState<string | unknown>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function queryStorage() {
      const value = await storage.read(key)
      setData(value);
      setLoading(false)
    }

    queryStorage();
  }, [setData, setLoading, storage, key])

  const setStorage = useCallback((value) => {
    storage.write(key, value)
  }, [storage, key])

  return [{data, loading}, setStorage] as [{data: string | unknown, loading: boolean}, (value: boolean) => void]
}
