UPDATE public.scores s
SET details = jsonb_set(
  jsonb_set(
    s.details::jsonb,
    '{full_name}',
    to_jsonb(coalesce(u.raw_user_meta_data->>'full_name', '未知姓名'))
  ),
  '{student_id}',
  to_jsonb(coalesce(u.raw_user_meta_data->>'student_id', '未知学号'))
)
FROM auth.users u
WHERE s.user_id = u.id;
