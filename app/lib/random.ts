// A custom implementation of Math.random() which supports having distinct rng instances


const MASK = 0xFFFFFFFFFFFFFFFFn;

function reverse17(val: bigint): bigint {
  return val ^ (val >> 17n) ^ (val >> 34n) ^ (val >> 51n);
}

function reverse23(val: bigint): bigint {
  return (val ^ (val << 23n) ^ (val << 46n)) & MASK;
}

function xs128pBackward(state0: bigint, state1: bigint) {
  const prevState1 = state0;
  let prevState0 = state1 ^ (state0 >> 26n);
  prevState0 = prevState0 ^ state0;
  prevState0 = reverse17(prevState0);
  prevState0 = reverse23(prevState0);
  const generated = prevState0;
  return { prevState0, prevState1, generated };
}

// TODO: change impl for safari and firefox
function toDouble(out: bigint): number {
  const doubleBits = (out >> 12n) | 0x3FF0000000000000n;
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, doubleBits, true);
  return view.getFloat64(0, true) - 1;
}

function nextState(state0: bigint, state1: bigint) {
  // TODO: handle different browsers
  const { prevState0, prevState1, generated } = xs128pBackward(state0, state1);
  return { prevState0, prevState1, generated };
}

export class Random {
  private state0: bigint;
  private state1: bigint;

  constructor(state0?: bigint, state1?: bigint) {
    if (state0 == undefined || state1 == undefined) {
      const buffer = new Uint8Array(16); // 16 = 2 * 8 bytes
      crypto.getRandomValues(buffer);
      this.state0 = BigInt.asUintN(64, BigInt('0x' + Array.from(buffer.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('')));
      this.state1 = BigInt.asUintN(64, BigInt('0x' + Array.from(buffer.slice(8, 16)).map(b => b.toString(16).padStart(2, '0')).join('')));
    } else {
      this.state0 = state0;
      this.state1 = state1;
    }
  }

  
  public random(): number {
    const { prevState0, prevState1, generated } = nextState(this.state0, this.state1);
    this.state0 = prevState0;
    this.state1 = prevState1;
    return toDouble(generated);
  }

  
  public getState() {
    return { state0: this.state0, state1: this.state1 };
  }
}