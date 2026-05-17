
ALTER TABLE public.cars
  ADD CONSTRAINT cars_year_range CHECK (year IS NULL OR (year BETWEEN 1900 AND 2035)),
  ADD CONSTRAINT cars_make_len CHECK (char_length(make) BETWEEN 1 AND 50),
  ADD CONSTRAINT cars_model_len CHECK (char_length(model) BETWEEN 1 AND 50),
  ADD CONSTRAINT cars_plate_len CHECK (plate_number IS NULL OR char_length(plate_number) BETWEEN 1 AND 20),
  ADD CONSTRAINT cars_color_len CHECK (color IS NULL OR char_length(color) BETWEEN 1 AND 30);

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_notes_len CHECK (notes IS NULL OR char_length(notes) <= 1000),
  ADD CONSTRAINT bookings_price_nonneg CHECK (price IS NULL OR price >= 0);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{7,20}$'),
  ADD CONSTRAINT profiles_full_name_len CHECK (char_length(full_name) <= 100);
