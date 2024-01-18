use super::schema::{chats, signatures};
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Insertable, Deserialize)]
#[table_name = "chats"]
pub struct NewChat {
    pub message: String,
    pub sender: String,
    pub timestamp: NaiveDateTime,
}

#[derive(Queryable, Serialize)]
pub struct Chat {
    pub id: i32,
    pub message: String,
    pub sender: String,
    pub timestamp: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[table_name = "signatures"]
pub struct NewLenderSignature {
    pub lender_address: String,
    pub borrow_request_id: i32,
    pub signature: String,
}

#[derive(Queryable, Serialize)]
pub struct LenderSignature {
    pub id: i32,
    pub lender_address: String,
    pub borrow_request_id: i32,
    pub signature: String,
}
