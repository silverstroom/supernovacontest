export interface Artist {
  id: string;
  name: string;
  instagram?: string;
  song1_url: string;
  song1_title?: string;
  song2_url: string;
  song2_title?: string;
  song3_url: string;
  song3_title?: string;
  city: 'bologna' | 'rende';
  rating?: number;
  referent_name?: string;
  date_created?: string;
}

export interface GravityFormsResponse {
  entries: Artist[];
  total: number;
}
