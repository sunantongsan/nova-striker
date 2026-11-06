'use strict';
// Candidate policy only. Not loaded by the live game until server/client integration.
const POLICY = Object.freeze({version:1,launchBonusNova:1000,launchDays:30,costPercent:90,timePercent:90,normalArmyRequiresResources:true,normalArmyRequiresTime:true});
function integer(n,label){if(!Number.isSafeInteger(n)||n<0)throw new RangeError(label+' must be a nonnegative safe integer');return n;}
function discounted(n){integer(n,'baseline');return Number((BigInt(n)*9n+9n)/10n);}
function quote(entry){
 if(!entry||entry.baseline!=='normal'||!entry.source||!/^https:\/\//.test(entry.source)||!entry.checkedAt)throw new Error('Verified normal baseline required');
 const costs={};for(const [resource,amount] of Object.entries(entry.costs||{}))costs[resource]=discounted(amount);
 return Object.freeze({costs:Object.freeze(costs),seconds:discounted(integer(entry.seconds,'seconds')),policyVersion:POLICY.version,referenceId:entry.id});
}
const builderBaseline=[0,250,500,1000,2000];
function builderPrice(ordinal){if(!Number.isInteger(ordinal)||ordinal<1||ordinal>5)throw new RangeError('Unknown builder');return discounted(builderBaseline[ordinal-1]);}
function trainingQuote({unlocked,spacePerUnit,quantity,capacity,occupied,costs,secondsPerUnit,special=false}){
 if(special)throw new Error('Special units need their own verified progression mapping');
 if(!unlocked)throw new Error('Unit is locked');
 for(const [k,v] of Object.entries({spacePerUnit,quantity,capacity,occupied}))integer(v,k);
 if(!spacePerUnit||!quantity)throw new Error('Empty army request');
 const space=BigInt(spacePerUnit)*BigInt(quantity);
 if(BigInt(occupied)+space>BigInt(capacity))throw new Error('Army capacity exceeded');
 integer(secondsPerUnit,'secondsPerUnit');
 if(!secondsPerUnit||!costs||!Object.keys(costs).length)throw new Error('Paid timed training required');
 const total={};for(const [resource,n] of Object.entries(costs)){integer(n,resource);total[resource]=integer(n*quantity,'total cost');}
 if(!Object.values(total).some(n=>n>0))throw new Error('Paid training required');
 return Object.freeze({costs:Object.freeze(total),seconds:integer(secondsPerUnit*quantity,'total seconds'),space:Number(space)});
}
module.exports={POLICY,discounted,quote,builderPrice,trainingQuote};

