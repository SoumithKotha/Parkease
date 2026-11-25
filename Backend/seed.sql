--
-- PostgreSQL database dump
--

\restrict HjzK3VR7ufWOUJteTN3Pdc9vowBM9a4bg8zoml3IMuQAZBWYIvEnxEfQg3jA14Q

-- Dumped from database version 16.16
-- Dumped by pg_dump version 16.16


ALTER TABLE IF EXISTS ONLY public.parking_slots DROP CONSTRAINT IF EXISTS parking_slots_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.parking_locations DROP CONSTRAINT IF EXISTS parking_locations_owner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_slot_id_fkey;
DROP INDEX IF EXISTS public.idx_bookings_availability;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.parking_slots DROP CONSTRAINT IF EXISTS parking_slots_pkey;
ALTER TABLE IF EXISTS ONLY public.parking_slots DROP CONSTRAINT IF EXISTS parking_slots_location_id_slot_number_key;
ALTER TABLE IF EXISTS ONLY public.parking_locations DROP CONSTRAINT IF EXISTS parking_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_qr_code_hash_key;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.parking_slots;
DROP TABLE IF EXISTS public.parking_locations;
DROP TABLE IF EXISTS public.bookings;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.booking_status;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'owner',
    'admin'
);




--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    slot_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status public.booking_status DEFAULT 'confirmed'::public.booking_status,
    qr_code_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_timespan CHECK ((end_time > start_time))
);


--
-- Name: parking_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid,
    name character varying(150) NOT NULL,
    address text NOT NULL,
    hourly_rate numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: parking_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_id uuid,
    slot_number character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    slot_type character varying(20) DEFAULT 'compact'::character varying
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    role public.user_role DEFAULT 'customer'::public.user_role,
    created_at timestamp with time zone DEFAULT now(),
    name character varying(120),
    password_hash text
);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.bookings VALUES ('59bf4f08-dca7-43f7-9527-79f14a871925', '12d1f8d0-8340-4ea8-a327-0054867c3a33', '34ab80b4-fe92-41fa-97d2-be16c1fd6fbe', '2026-11-23 10:16:00+00', '2026-11-23 12:16:00+00', 500.00, 'checked_in', '88861309cf9730fe8b129ddb55c4e8f4', '2026-11-23 09:16:39.845298+00');
INSERT INTO public.bookings VALUES ('59de8b19-621c-49d8-b042-01151e90be17', '5986e90f-4a9a-46b4-a8be-32e025867531', 'b581d603-e19e-45a5-83d0-a530d253c3b1', '2026-11-23 12:50:00+00', '2026-11-23 14:50:00+00', 400.00, 'checked_in', 'fd048c1df3f955c476b85b63b635d477', '2026-11-23 11:50:51.723074+00');
INSERT INTO public.bookings VALUES ('f9fe04ef-a831-4f9d-898a-d161db3b4cca', '5986e90f-4a9a-46b4-a8be-32e025867531', 'c050e58c-6dd6-430c-a24c-c0effe15d1c2', '2026-11-23 14:50:00+00', '2026-11-23 16:50:00+00', 400.00, 'cancelled', 'ea68bafbb1b1536db540ae045b679221', '2026-11-23 13:50:58.570522+00');
INSERT INTO public.bookings VALUES ('4c810fd1-0896-436f-8ded-078fee98b785', '5986e90f-4a9a-46b4-a8be-32e025867531', '6df3523c-0ac3-4b42-a579-82fcf367d6f9', '2026-11-25 15:10:00+00', '2026-11-25 17:10:00+00', 400.00, 'checked_in', 'c6d2742136f4677d5cbe0689d37722aa', '2026-11-25 14:10:19.613018+00');
INSERT INTO public.bookings VALUES ('4749c4fc-c84a-4fde-99ad-47c81338fa76', '5986e90f-4a9a-46b4-a8be-32e025867531', '063e771e-fa81-4db8-aea6-9e0e73df3521', '2026-11-25 15:26:00+00', '2026-11-25 17:26:00+00', 400.00, 'confirmed', 'e5efbd6f18890c901254291ed46bd9a5', '2026-11-25 14:26:23.970571+00');


--
-- Data for Name: parking_locations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.parking_locations VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'HITEC City • Mindspace Parking Hub', 'Madhapur, HITEC City Main Rd, Hyderabad', 200.00, '2026-11-23 08:58:08.854694+00');
INSERT INTO public.parking_locations VALUES ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Banjara Hills • GVK One Plaza', 'Road No. 1, Banjara Hills, Hyderabad', 200.00, '2026-11-23 09:13:41.019531+00');
INSERT INTO public.parking_locations VALUES ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'Gachibowli • Financial District Lot', 'Nanakramguda, Financial District, Hyderabad', 200.00, '2026-11-23 09:13:41.024337+00');


--
-- Data for Name: parking_slots; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.parking_slots VALUES ('c050e58c-6dd6-430c-a24c-c0effe15d1c2', '11111111-1111-1111-1111-111111111111', 'A-01', true, 'compact');
INSERT INTO public.parking_slots VALUES ('b581d603-e19e-45a5-83d0-a530d253c3b1', '11111111-1111-1111-1111-111111111111', 'A-02', true, 'compact');
INSERT INTO public.parking_slots VALUES ('ca58b81d-c27f-4ef2-8431-8d1135171012', '11111111-1111-1111-1111-111111111111', 'A-03', true, 'compact');
INSERT INTO public.parking_slots VALUES ('063e771e-fa81-4db8-aea6-9e0e73df3521', '11111111-1111-1111-1111-111111111111', 'A-04', true, 'compact');
INSERT INTO public.parking_slots VALUES ('6df3523c-0ac3-4b42-a579-82fcf367d6f9', '11111111-1111-1111-1111-111111111111', 'B-01', true, 'suv');
INSERT INTO public.parking_slots VALUES ('83e3637c-e8b8-426e-83d8-e76b1070885c', '11111111-1111-1111-1111-111111111111', 'B-02', true, 'suv');
INSERT INTO public.parking_slots VALUES ('4e2835e9-5c0d-4de1-8e8d-eca538e22bd4', '11111111-1111-1111-1111-111111111111', 'B-03', true, 'suv');
INSERT INTO public.parking_slots VALUES ('5792ab60-fa31-4b8c-a591-95758ca83a8f', '11111111-1111-1111-1111-111111111111', 'C-01', true, 'ev');
INSERT INTO public.parking_slots VALUES ('34ab80b4-fe92-41fa-97d2-be16c1fd6fbe', '11111111-1111-1111-1111-111111111111', 'C-02', true, 'ev');
INSERT INTO public.parking_slots VALUES ('edf03579-8513-4762-9125-960e9968d8b6', '11111111-1111-1111-1111-111111111111', 'D-01', true, 'accessible');
INSERT INTO public.parking_slots VALUES ('53203231-4f0d-4f53-81a4-7584e750b2a7', '22222222-2222-2222-2222-222222222222', 'A-01', true, 'compact');
INSERT INTO public.parking_slots VALUES ('19858546-c03c-4771-acdf-95de5c0eb96c', '22222222-2222-2222-2222-222222222222', 'A-02', true, 'compact');
INSERT INTO public.parking_slots VALUES ('63c60005-2191-43da-8117-aaf021f25096', '22222222-2222-2222-2222-222222222222', 'A-03', true, 'compact');
INSERT INTO public.parking_slots VALUES ('e12e8bf1-c784-412e-b890-2eb584aea7bd', '22222222-2222-2222-2222-222222222222', 'A-04', true, 'compact');
INSERT INTO public.parking_slots VALUES ('c0a93cad-c21e-43dd-b593-9a79869477c7', '22222222-2222-2222-2222-222222222222', 'B-01', true, 'suv');
INSERT INTO public.parking_slots VALUES ('a89f8564-0c03-4fa0-a98f-26489f3d9d41', '22222222-2222-2222-2222-222222222222', 'B-02', true, 'suv');
INSERT INTO public.parking_slots VALUES ('786b2973-ea03-4396-addb-3224eca59582', '22222222-2222-2222-2222-222222222222', 'B-03', true, 'suv');
INSERT INTO public.parking_slots VALUES ('1925938e-c27c-498d-a7af-122d6aac47a4', '22222222-2222-2222-2222-222222222222', 'C-01', true, 'ev');
INSERT INTO public.parking_slots VALUES ('d56a4ce8-01d7-4316-9519-24f94ff70034', '22222222-2222-2222-2222-222222222222', 'C-02', true, 'ev');
INSERT INTO public.parking_slots VALUES ('9864d138-2983-4c6d-ad69-bc1ddc3829e0', '22222222-2222-2222-2222-222222222222', 'D-01', true, 'accessible');
INSERT INTO public.parking_slots VALUES ('89bc3a6a-8643-4d8a-baad-de5715c6dafe', '33333333-3333-3333-3333-333333333333', 'A-01', true, 'compact');
INSERT INTO public.parking_slots VALUES ('853adbf2-4ccf-4a0e-8682-eb84f64443b9', '33333333-3333-3333-3333-333333333333', 'A-02', true, 'compact');
INSERT INTO public.parking_slots VALUES ('02c1b6cb-ebf8-4fc9-8cc3-56c289e1c0a0', '33333333-3333-3333-3333-333333333333', 'A-03', true, 'compact');
INSERT INTO public.parking_slots VALUES ('87dd8a3b-2ab5-456d-9ad8-8d0d0b9b86d6', '33333333-3333-3333-3333-333333333333', 'A-04', true, 'compact');
INSERT INTO public.parking_slots VALUES ('12dc18e1-6678-4ddd-af36-a7a9838ddd05', '33333333-3333-3333-3333-333333333333', 'B-01', true, 'suv');
INSERT INTO public.parking_slots VALUES ('d8a6e7f2-240b-4f1e-a4bc-f50a7ca125c9', '33333333-3333-3333-3333-333333333333', 'B-02', true, 'suv');
INSERT INTO public.parking_slots VALUES ('1b881ccd-1788-4b38-ab91-4a16bd9f512c', '33333333-3333-3333-3333-333333333333', 'B-03', true, 'suv');
INSERT INTO public.parking_slots VALUES ('9c1b7257-ba5c-407f-9665-cee5f08cef5c', '33333333-3333-3333-3333-333333333333', 'C-01', true, 'ev');
INSERT INTO public.parking_slots VALUES ('f2cf7731-b326-488a-9ec8-d645652615f7', '33333333-3333-3333-3333-333333333333', 'C-02', true, 'ev');
INSERT INTO public.parking_slots VALUES ('7af93d65-031c-436c-a4bf-8bc33cdeac37', '33333333-3333-3333-3333-333333333333', 'D-01', true, 'accessible');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('761c7cbb-fef0-4ba5-abc0-6a298adf85b8', '00781qe@gmail.com', 'sds', 'customer', '2026-11-23 08:56:48.440593+00', NULL, '75fdaefb6f1d2c036af8cdfb5c7d29f4:02c53735c55d4fd2e89824ba92ada9ddc0d831bf899b2c1e8d32c3122f5f5d1133619fb2b93087ddf8d6ac26870ed417676efc2ceb7711ed9fdf06fcbc192250');
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000002', 'owner@parkease.com', 'Demo Owner', 'owner', '2026-11-23 08:58:08.854694+00', NULL, NULL);
INSERT INTO public.users VALUES ('436b666e-89f9-4c05-a0d9-a354d8492f4f', 'soumithreddylfhs@gmail.com', 'sds', 'customer', '2026-11-23 09:01:06.506719+00', NULL, 'b5eb4206b73a9214a8437ae5ac0d02f5:477931e2937e8efdb3a0acc59ef8f5783f056acfeff5d583df26206329217e0482540ff6b41a1323c9c1706df868f801af97022c88295b680fa42f51502a8507');
INSERT INTO public.users VALUES ('aab1084f-5520-4bfe-af2b-50257982dd33', 'eisenreddy@gmail.com', 'sds', 'customer', '2026-11-23 09:01:36.14684+00', NULL, '4f155cf1f65fb8f7cbf2c151f5d78348:d09de59b8d69c63e9af015dc416e7ea02159beb35c1bac97960ead86d214f94f58bc52f653187e6e60e6b33fed1d8a52ad554b924d9bc12f45c49af1e0410bff');
INSERT INTO public.users VALUES ('12d1f8d0-8340-4ea8-a327-0054867c3a33', 'erere@gmail.com', 'sds', 'customer', '2026-11-23 09:01:58.499571+00', NULL, '3f18f7741ae0161122aaefa609121a9c:e64ba8fdd97c694aab71b3f5581f589bb5e7da7b0a5b6224a44d85a51961ac5d18571c6396e93e2851a4c13cfb591f0f2ad11cf26b5fb7f688d9b1d469ca6ca2');
INSERT INTO public.users VALUES ('5986e90f-4a9a-46b4-a8be-32e025867531', 'reddyeisen@gmail.com', 'sfsfsf', 'customer', '2026-11-23 11:50:09.248983+00', NULL, '073505f370796da44c1a8f0971b32a5f:1d54ea3e9abdfc7ad28c7397089cefe942d132d68aef6debf6e76e01344fd983a61689e06aaf2608c02b5c0bfd915669c9614ac6c7c82ec9f4eabd41a5a42a29');


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_qr_code_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_qr_code_hash_key UNIQUE (qr_code_hash);


--
-- Name: parking_locations parking_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_locations
    ADD CONSTRAINT parking_locations_pkey PRIMARY KEY (id);


--
-- Name: parking_slots parking_slots_location_id_slot_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_location_id_slot_number_key UNIQUE (location_id, slot_number);


--
-- Name: parking_slots parking_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_bookings_availability; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_availability ON public.bookings USING btree (slot_id, start_time, end_time);


--
-- Name: bookings bookings_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.parking_slots(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parking_locations parking_locations_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_locations
    ADD CONSTRAINT parking_locations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parking_slots parking_slots_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.parking_locations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict HjzK3VR7ufWOUJteTN3Pdc9vowBM9a4bg8zoml3IMuQAZBWYIvEnxEfQg3jA14Q

