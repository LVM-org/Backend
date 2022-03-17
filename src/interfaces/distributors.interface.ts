export interface Distributor {
  id: number;
  name: string;
  user_id: number;
  metadata: string;
}

export interface Distribution {
  id: number;
  key: string;
  book_id: number;
  distributor_id: number;
}

export interface DistributionActivity {
  id: number;
  distribution_id: number;
  type: string;
  data: string;
}
