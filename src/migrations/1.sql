create table trackers (
    id varchar(36),
    name varchar(50),
    type varchar(10),
    user_id varchar(36),
    created_at varchar(24),
    updated_at varchar(24) null
);

create unique index uk_trackers_id on trackers (id);
create index idx_trackers_user_id on trackers(user_id);

create table tracker_values (
    id varchar(36),
    tracker_id varchar(36),
    tracker_user_id varchar(36),
    value_date varchar(10),
    value varchar(25),
    created_at varchar(24),
    updated_at varchar(24) null
);

create unique index uk_tracker_values on tracker_values (id);
create index idx_tracker_values_tracker_user on tracker_values (tracker_id, tracker_user_id);

create table users (
    id varchar(36),
    email varchar(150),
    password_hash varchar(255),
    created_at varchar(24),
    verification_token varchar(36),
    verification_token_created_at varchar(24),
    email_verified boolean,
    email_verified_at varchar(24) null
);

create unique index uk_users_id on users (id);
create index idx_users_email on users(email);

create table tokens (
    token varchar(255),
    type varchar(25),
    user_id varchar(36),
    created_at varchar(24),
    expires_at varchar(24),
    revoked_at varchar(24) null
);

create unique index uk_tokens_token on tokens (token);
create index idx_tokens_user_id_type on tokens(user_id, type);

create table audit (
    id varchar(36),
    user_id varchar(36),
    message varchar(255),
    occurred_at varchar(24)
);

create unique index uk_audit_id on audit (id);
create index idx_audit_user_id on audit (user_id);
