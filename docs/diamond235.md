# Diamond recovery and separate resource menus

The local game balance and the server resource wallet were historically separate. Huhuhu reported a visible balance of 10,002 with a server wallet of zero. A scoped, one-time support reconciliation credits that existing visible balance on the server; it does not grant another local bonus or restore the retired daily giveaway. The transaction requires the observed zero balance and unclaimed daily state, and must not be repeated.

Resource quotes now first show two separate navigation choices. The ad screen contains only the rewarded-ad action; the diamond screen contains only the exchange confirmation. Neither selecting a resource nor selecting a method spends currency or starts an ad.

Definitive server rejection (insufficient server diamonds, changed price or full storage) now uses the existing same-ID cancellation protocol. Only after server confirmation does the client refund the reserved debit and clear pending state. A lost reply retains the original receipt for safe recovery; a receipt already completed on the server is delivered instead of being refunded.

Validation: economy233-ui covers separated screens, no implicit spending, network retry, definitive-denial cancellation, refund and existing save-failure guards. Existing server receipt tests cover cancellation and idempotence.
