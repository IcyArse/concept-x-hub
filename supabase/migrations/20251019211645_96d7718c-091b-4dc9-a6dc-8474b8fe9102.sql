-- Create a safe server-side function to create a conversation and add both participants
create or replace function public.create_conversation_with_participants(_user1 uuid, _user2 uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  conv_id uuid;
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Authentication required';
  end if;
  if caller <> _user1 and caller <> _user2 then
    raise exception 'Caller must be a participant';
  end if;

  insert into public.conversations default values returning id into conv_id;

  -- Add both participants (avoid duplicate when same id)
  insert into public.conversation_participants (conversation_id, user_id)
  values (conv_id, _user1);

  if _user2 <> _user1 then
    insert into public.conversation_participants (conversation_id, user_id)
    values (conv_id, _user2);
  end if;

  return conv_id;
end;
$$;

-- Allow authenticated users to execute
grant execute on function public.create_conversation_with_participants(uuid, uuid) to authenticated;