export type ResponseFormat = "markdown" | "json";

export interface PagedResult<T> {
  results: T[];
  total: number;
  per_page: number;
  page: number;
  query?: string;
}

export interface SubscriberListMembership {
  id: number;
  uuid?: string;
  name?: string;
  subscription_status: string;
}

export interface Subscriber {
  id: number;
  created_at?: string;
  updated_at?: string;
  uuid: string;
  email: string;
  name: string;
  attribs?: Record<string, unknown>;
  status: string;
  lists?: SubscriberListMembership[];
}

export interface List {
  id: number;
  created_at?: string;
  updated_at?: string;
  uuid: string;
  name: string;
  type: string;
  optin: string;
  tags?: string[];
  subscriber_count?: number;
  description?: string;
}

export interface CampaignListRef {
  id: number;
  name: string;
}

export interface Campaign {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  subject: string;
  lists?: CampaignListRef[];
  from_email?: string;
  content_type?: string;
  messenger?: string;
  type?: string;
  status?: string;
  tags?: string[];
  views?: number;
  clicks?: number;
  to_send?: number;
  sent?: number;
  started_at?: string;
  send_at?: string;
  body?: string;
  template_id?: number;
}

export interface Template {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  body?: string;
  body_source?: string;
  subject?: string;
  type: string;
  is_default: boolean;
}

export interface Bounce {
  id: number;
  type: string;
  source?: string;
  meta?: Record<string, unknown>;
  created_at: string;
  email?: string;
  subscriber_uuid?: string;
  subscriber_id?: number;
  campaign?: CampaignListRef;
}

export interface MediaFileObject {
  id: number;
  uuid: string;
  filename: string;
  content_type: string;
  created_at?: string;
  thumb_url?: string;
  thumb_uri?: string;
  provider?: string;
  meta?: Record<string, unknown>;
  url?: string;
  uri?: string;
}

export interface ImportStatus {
  name?: string;
  total?: number;
  imported?: number;
  status?: string;
}
