import {
  reactExtension,
  BlockStack,
  useApi,
  useTranslate,
  Button,
  useOrder,
  Text
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


  async function handleSubmit(){
    console.log('cancel order button clicked');
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
  const { extension, sessionToken } = useApi();
  const order = useOrder();
  const [loading, setLoading] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (orderCancelled) {
      location.reload();
    }
  }, [orderCancelled]);
  
  async function handleSubmit(){
    setLoading(true);
    //simulate the server request here
    const token = await sessionToken.get();
    const response = await fetch('https://bent-gratuit-jvc-compliant.trycloudflare.com/app/api/order-cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({orderId: order.id})
    });
    const apiResponse = await response.json();
 
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(apiResponse.success)
        setLoading(false)
        resolve(true);
        if(apiResponse.success){
          setOrderCancelled(true);
          setSuccessMessage('Order cancelled successfully'); 
        }
      }, 2000);
    });

  }

  if(!order || order.cancelledAt !== undefined){
    return null;
  }

  return (
    <BlockStack>
      {orderCancelled ? <Text appearance="success" size="medium">{successMessage}</Text> : (
      <Button appearance="critical" onPress={handleSubmit} loading={loading}>
         {translate("cancelButton")}
      </Button>
      )}
      
    </BlockStack>
  );
}
