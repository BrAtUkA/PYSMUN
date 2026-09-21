-- Delegate program: CNIC/B-form ID document upload support (image or PDF).
-- Bucket already accepts application/pdf as of migration 008.

alter table public.applications
  add column if not exists id_document_path text,
  add column if not exists id_document_mime_type text,
  add column if not exists id_document_size_bytes integer;
