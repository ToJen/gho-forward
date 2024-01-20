use crate::database::Database;
use crate::models::{NewLenderSignature, SignatureQuery};
use actix_web::{web, HttpResponse, Responder};
use chrono::Utc;

// pub async fn chat_handler(
//     db: web::Data<Database>,
//     chat_message: web::Json<NewChat>,
// ) -> impl Responder {
//     let new_chat = NewChat {
//         message: chat_message.message.clone(),
//         sender: chat_message.sender.clone(),
//         timestamp: Utc::now().naive_utc(), // Current timestamp in UTC
//     };
//
//     // Use db to store the new chat in the database
//     match db.create_chat(new_chat) {
//         Ok(_) => HttpResponse::Ok().json("Chat added successfully"),
//         Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
//     }
// }

pub async fn signatures_handler(
    db: web::Data<Database>,
    data: web::Json<NewLenderSignature>,
) -> impl Responder {
    // Use db to store lender's blockchain address, borrowRequestId, and signature
    match db.create_signature(data.into_inner()) {
        Ok(signature) => HttpResponse::Ok().json(signature),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

pub async fn get_signatures_handler(
    db: web::Data<Database>,
    web::Query(info): web::Query<SignatureQuery>,
) -> impl Responder {
    // Use db to fetch signature based on borrowRequestId
    match db.get_signature_by_borrower(info.borrow_request_id) {
        Some(signature) => HttpResponse::Ok().json(signature),
        None => HttpResponse::NotFound().finish(),
    }
}
