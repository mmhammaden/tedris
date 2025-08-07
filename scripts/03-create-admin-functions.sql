-- Create a function to get registration statistics
CREATE OR REPLACE FUNCTION get_registration_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'by_category', (
      SELECT json_object_agg(user_category, count)
      FROM (
        SELECT user_category, COUNT(*) as count
        FROM users
        GROUP BY user_category
      ) category_counts
    ),
    'by_wilaya', (
      SELECT json_object_agg(wilaya, count)
      FROM (
        SELECT wilaya, COUNT(*) as count
        FROM users
        GROUP BY wilaya
        ORDER BY count DESC
        LIMIT 10
      ) wilaya_counts
    ),
    'recent_registrations', (
      SELECT COUNT(*)
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
