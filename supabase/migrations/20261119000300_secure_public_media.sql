-- Public-media must not be a broadly public storage bucket. Only staff can read
-- or manage objects; future public delivery should use explicit, server-approved
-- signed URLs or a separate CDN workflow.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'public-media';

drop policy if exists "public can read published media files" on storage.objects;

create policy "staff can read public media"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'public-media'
    and public.has_staff_role(array['owner', 'administrator', 'content_editor'])
  );
