-- Directorate program: CV upload support (image or PDF).

alter table public.applications
  add column if not exists cv_path text,
  add column if not exists cv_mime_type text,
  add column if not exists cv_size_bytes integer;

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
where id = 'application-photos';
