use crate::models::{NewChat, NewLenderSignature};
use actix_web::{web, HttpResponse, Responder};
use chrono::Utc;

pub async fn chat_handler(chat_message: web::Json<NewChat>) -> impl Responder {
    let new_chat = NewChat {
        message: chat_message.message.clone(),
        sender: chat_message.sender.clone(),
        timestamp: Utc::now().naive_utc(), // Current timestamp in UTC
    };

    // Logic to store the new chat in the database
    HttpResponse::Ok().finish()
}

pub async fn signatures_handler(data: web::Json<NewLenderSignature>) -> impl Responder {
    // Logic to store lender's blockchain address, borrowRequestId, and signature
    HttpResponse::Ok().finish()
}

pub async fn get_signatures_handler(
    web::Query(info): web::Query<NewLenderSignature>,
) -> impl Responder {
    // Logic to fetch signature based on borrowRequestId
    HttpResponse::Ok().finish()
}
