DROP POLICY IF EXISTS "Customers cancel own bookings" ON public.bookings;

CREATE POLICY "Customers cancel own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id AND status NOT IN ('completed','cancelled'))
WITH CHECK (
  auth.uid() = customer_id
  AND status = 'cancelled'
);