export const PRODUCTS=Object.freeze({nova_5000:5000,nova_10500:10500,nova_19000:19000,nova_40000:40000,nova_85000:85000,nova_180000:180000});
export async function hash(text){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function validateReceipt(purchase,uid,product){
 if(!PRODUCTS[product])throw Error('unknown_product');
 if(purchase.purchaseStateContext?.purchaseState!=='PURCHASED')throw Error('purchase_not_completed');
 if(purchase.testPurchaseContext?.fopType!=='TEST')throw Error('test_purchases_only');
 if(purchase.obfuscatedExternalAccountId!==await hash(uid))throw Error('wrong_account');
 const lines=purchase.productLineItem;if(!Array.isArray(lines)||lines.length!==1||lines[0].productId!==product)throw Error('product_mismatch');
 const offer=lines[0].productOfferDetails;if(!offer||offer.quantity!==1||offer.refundableQuantity!==1)throw Error('quantity_or_refund');
 return {nova:PRODUCTS[product],orderId:purchase.orderId||null};
}
