import {
  reactExtension,
  BlockStack,
  useApi,
  useTranslate,
  Button,
  useOrder,
  Banner
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
  const { extension, sessionToken, query } = useApi();
  const order = useOrder();
  const [loading, setLoading] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [orderData, setOrderData] =useState<any>();

  useEffect (() => {
    query(
      `query {
        order(id: "${order.id}"){
          name
          tags
        }
      }`
     ).then(({data, errors}) => {
      console.log(order.id)
      setOrderData(data);
     }).catch(error => {
      console.error(error);
     });
  }, [order]);

 

  const isLessthanAnHourAgo = () => {
    if(!order || !order.processedAt ) return false;
    const processedAtDate = new Date(order.processedAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - processedAtDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    return hoursDifference < 1;
  }
  
  async function handleSubmit(){
    setLoading(true);
    //simulate the server request here
    const token = await sessionToken.get();
    const response = await fetch('https://greece-decent-voltage-speak.trycloudflare.com/app/api/order-cancel', {
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
        setLoading(false)
        resolve(true);
        if(apiResponse.success){
          setOrderCancelled(true);
          setSuccessMessage('Order cancelled successfully, you can go back or refresh the page to see the updated status of your order. You will get refunded within 1-2 business days.'); 
        }
      }, 2000);
    });

  }

  if(!order || order.cancelledAt !== undefined || !isLessthanAnHourAgo()){
    return null;
  }

  return (
    <BlockStack>
      {orderCancelled ? <Banner status="success" title={successMessage} /> : (
      <Button appearance="critical" onPress={handleSubmit} loading={loading}>
         {translate("cancelButton")}
      </Button>
      )}
      
    </BlockStack>
  );
}
