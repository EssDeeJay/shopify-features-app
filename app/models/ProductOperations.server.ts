import prisma from "../db.server";

export async function getShopSession(shop: string){
  
   const exists = await prisma.session.findFirst({
      where: {
        shop: shop
      }
   });

   // we will also need to check if the session has the expires date and compare with the today's date
   const expiry = exists?.expires && exists.expires <= new Date(Date.now());

   if(exists && !exists.isOnline && !expiry){
      const updatedRecord = await prisma.session.update({
         where: {
           id: exists.id
         },
         data: {
            isOnline: true,
            state: "active",
            expires: new Date(Date.now() + (24 * 60 * 60 * 1000))
         }
      });
      console.log('shop session updated as it was not online or expired, check mongodb for update.');
      return updatedRecord;
   }
   console.log('shop session must be already upto date');

   return null;
}

export const createProductOperations = async (products: any[]) => {

}

export const updateProductOperations = async(products: any[]) => {

}

export const deleteProductOperations = async(products: any[]) => {
    
}

