
-- Enable replication for Realtime on these tables
alter publication supabase_realtime add table official_token;
alter publication supabase_realtime add table stream_feed;

-- Ensure RLS allows anonymous access (since we are using anon key)
alter table official_token enable row level security;
alter table stream_feed enable row level security;

create policy "Allow public read official_token"
on official_token for select
to anon
using (true);

create policy "Allow public insert official_token"
on official_token for insert
to anon
with check (true);

create policy "Allow public update official_token"
on official_token for update
to anon
using (true);

create policy "Allow public read stream_feed"
on stream_feed for select
to anon
using (true);

create policy "Allow public insert stream_feed"
on stream_feed for insert
to anon
with check (true);
