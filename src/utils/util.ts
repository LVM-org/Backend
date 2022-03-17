import * as BufferLayout from 'buffer-layout';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

/**
 * Layout for a public key
 */
const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property);
};

// /**
//  * Layout for a f64bit unsigned value
//  */
// const f64 = (property = 'f64') => {
//   return BufferLayout.blob(8, property);
// };

export const MEDIA_DATA_LAYOUT = BufferLayout.struct([
  publicKey('author_pubkey'),
  uint64('price_per_minute'),
  uint64('distributor_fee'),
  publicKey('nft_token'),
  publicKey('nft_account_pubkey'),
]);

export interface MediaLayout {
  author_pubkey: Uint8Array;
  price_per_minute: number;
  distributor_fee: number;
  nft_token: Uint8Array;
  nft_account_pubkey: Uint8Array;
}

export const ACCESS_TIME_DATA_LAYOUT = BufferLayout.struct([publicKey('owner_pubkey'), uint64('total_time'), uint64('time_spent')]);

export interface AccessTimeLayout {
  owner_pubkey: Uint8Array;
  total_time: number;
  time_spent: number;
}
