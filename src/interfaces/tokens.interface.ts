export interface Token {
  id: number;
  public_key: string;
  type: 'fungible' | 'non_fungible';
  purpose: string;
}

export interface TokenActivity {
  token: Token;
  type: string;
  data: string;
}

export interface CipherParams {
  ct: string;
  iv?: string;
  s?: string;
}

export interface NftTokens {
  public_key: string;
  program_key: string;
}
