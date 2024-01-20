// @generated automatically by Diesel CLI.

diesel::table! {
    chats (id) {
        id -> Int4,
        message -> Text,
        sender -> Varchar,
        timestamp -> Timestamp,
    }
}

diesel::table! {
    signatures (id) {
        id -> Int4,
        lender_address -> Text,
        borrow_request_id -> Int4,
        signature -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    chats,
    signatures,
);
