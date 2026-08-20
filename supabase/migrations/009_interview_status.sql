-- Directorate applicants are shortlisted and interviewed before a final
-- decision, so the review lifecycle gains an explicit interview stage.

alter table public.applications
  drop constraint if exists applications_review_status_check;

alter table public.applications
  add constraint applications_review_status_check
  check (review_status in ('received', 'under_review', 'interview', 'accepted', 'waitlisted', 'rejected'));
