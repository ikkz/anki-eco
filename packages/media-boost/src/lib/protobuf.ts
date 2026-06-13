import { MediaBoostError } from './types.js';

const WIRE_VARINT = 0;
const WIRE_FIXED_64 = 1;
const WIRE_LENGTH_DELIMITED = 2;
const WIRE_FIXED_32 = 5;

class WireReader {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {}

  get done(): boolean {
    return this.offset >= this.bytes.length;
  }

  readVarint(): number {
    let value = 0;
    let shift = 0;
    while (shift < 35 && this.offset < this.bytes.length) {
      const byte = this.bytes[this.offset++];
      value += (byte & 0x7f) * 2 ** shift;
      if ((byte & 0x80) === 0) return value;
      shift += 7;
    }
    throw new MediaBoostError('INVALID_PACKAGE', 'Invalid protobuf varint.');
  }

  readBytes(): Uint8Array {
    const length = this.readVarint();
    const end = this.offset + length;
    if (end > this.bytes.length) {
      throw new MediaBoostError('INVALID_PACKAGE', 'Truncated protobuf message.');
    }
    const value = this.bytes.subarray(this.offset, end);
    this.offset = end;
    return value;
  }

  skip(wireType: number): void {
    if (wireType === WIRE_VARINT) {
      this.readVarint();
    } else if (wireType === WIRE_FIXED_64) {
      this.offset += 8;
    } else if (wireType === WIRE_LENGTH_DELIMITED) {
      const length = this.readVarint();
      this.offset += length;
    } else if (wireType === WIRE_FIXED_32) {
      this.offset += 4;
    } else {
      throw new MediaBoostError('INVALID_PACKAGE', `Unsupported protobuf wire type ${wireType}.`);
    }
    if (this.offset > this.bytes.length) {
      throw new MediaBoostError('INVALID_PACKAGE', 'Truncated protobuf message.');
    }
  }
}

export function parsePackageVersion(bytes: Uint8Array): number {
  const reader = new WireReader(bytes);
  let version = 0;
  while (!reader.done) {
    const tag = reader.readVarint();
    const field = tag >>> 3;
    const wireType = tag & 7;
    if (field === 1 && wireType === WIRE_VARINT) {
      version = reader.readVarint();
    } else {
      reader.skip(wireType);
    }
  }
  return version;
}

function parseMediaEntry(bytes: Uint8Array): string | undefined {
  const reader = new WireReader(bytes);
  let name: string | undefined;
  while (!reader.done) {
    const tag = reader.readVarint();
    const field = tag >>> 3;
    const wireType = tag & 7;
    if (field === 1 && wireType === WIRE_LENGTH_DELIMITED) {
      name = new TextDecoder('utf-8', { fatal: true }).decode(reader.readBytes());
    } else {
      reader.skip(wireType);
    }
  }
  return name;
}

export function parseMediaNames(bytes: Uint8Array): string[] {
  const reader = new WireReader(bytes);
  const names: string[] = [];
  while (!reader.done) {
    const tag = reader.readVarint();
    const field = tag >>> 3;
    const wireType = tag & 7;
    if (field === 1 && wireType === WIRE_LENGTH_DELIMITED) {
      const name = parseMediaEntry(reader.readBytes());
      if (name !== undefined) names.push(name);
    } else {
      reader.skip(wireType);
    }
  }
  return names;
}
