export type ListAllAvailableSlotsRequest = {
  meeting_type: "consultoria" | "mentoria";
  time_zone: string;
  year: string;
  month: string;
  day?: string;
};

export type Slot = {
  count: number;
  start_time: string;
  end_time: string;
};

export type ListAllAvailableSlotsResponse = {
  slots: Array<Slot>;
};

export type ListBookingsRequest = {
  start_date: string;
  end_date: string;
};

export type Booking = {
  id: string;
  start_time: string;
  end_time: string;
};

export type ListBookingsResponse = {
  bookings: Array<Booking>;
};

export type BookSlotRequest = {
  meeting_slug: string;
  name: string;
  email: string;
  slot_date: string;
  slot_start_time: string;
  time_zone: string;
};

export type BookSlotResponse = {
  booking: Booking;
};
