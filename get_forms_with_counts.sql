create or replace function get_forms_with_submission_counts(p_user_id uuid)
returns table (
    id uuid,
    title text,
    description text,
    created_at timestamptz,
    status form_status,
    submission_count bigint,
    sheet_connection json
) as $$
begin
    return query
    select
        f.id,
        f.title,
        f.description,
        f.created_at,
        f.status,
        (select count(*) from form_submissions fs where fs.form_id = f.id) as submission_count,
        (
          select row_to_json(sc)
          from sheet_connections sc
          where sc.id = f.default_sheet_connection_id
        ) as sheet_connection
    from
        forms f
    where
        f.user_id = p_user_id
    order by
        f.created_at desc;
end;
$$ language plpgsql;
