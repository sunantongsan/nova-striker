-- New SKUs preserve all old purchase entitlements, including pending receipts.
-- Do not deactivate old rows: restore must keep crediting the originally sold amount.
-- Apply server verifier + these rows before activating new products in Play Console.
begin;
insert into nova_private.nova_products348(product_id,nova,price_thb,active) values
 ('nova_1000',1000,30,true),
 ('nova_2100',2100,59,true),
 ('nova_3600',3600,99,true),
 ('nova_7600',7600,199,true),
 ('nova_16000',16000,399,true),
 ('nova_34000',34000,799,true);
commit;
