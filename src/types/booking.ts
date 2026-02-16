export interface BookingSlot {
  time: string;
  available: boolean;
}

export interface BookingPayload {
  name: string;
  email: string;
  date: string;
  time: string;
  lang: 'en' | 'es';
  notes?: string;
}

export interface BookingResponse {
  ok: boolean;
  eventId?: string;
  meetLink?: string;
  message?: string;
  error?: string;
}

export interface SlotsResponse {
  ok: boolean;
  slots: string[];
  cached?: boolean;
  error?: string;
}
