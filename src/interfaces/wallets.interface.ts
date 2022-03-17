export interface Wallet {
  id: number;
  public_key: string;
  secret_key: string;
}

export interface Transaction {
  id: number;
  type: string;
  status: string;
  data: string;
}
