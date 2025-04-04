import Random from './random';


function serializeBigInt(value: bigint): string {
  return value.toString() + 'n';
}


function parseBigInt(value: string): bigint {
  if (/^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  throw new Error("Invalid bigint string");
}


export function serializeRandom(random: Random): string {
  const state = random.getState();
  return serializeBigInt(state.state0) + ',' + serializeBigInt(state.state1);
}


export function parseRandom(state: string): Random {
  const stateSplit = state.split(',');
  const state0 = parseBigInt(stateSplit[0]);
  const state1 = parseBigInt(stateSplit[1]);
  return new Random(state0, state1);
}