use crate::database::Database;
use crate::models::{NewLenderSignature, SignatureQuery};
use actix_web::{web, HttpResponse, Responder};
use chrono::Utc;
use serde::Deserialize;

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

// gitcoin passport endpoints
#[derive(Deserialize)]
pub struct PassportSubmission {
    pub eth_address: String,
}

pub async fn submit_passport(data: web::Json<PassportSubmission>) -> impl Responder {
    let api_url: String =
        std::env::var("GITCOIN_PASSPORT_API_URL").expect("GITCOIN_PASSPORT_API_URL not set");
    let api_key: String =
        std::env::var("GITCOIN_PASSPORT_API_KEY").expect("GITCOIN_PASSPORT_API_KEY not set");
    let scorer_id: String =
        std::env::var("GITCOIN_PASSPORT_SCORER_ID").expect("GITCOIN_PASSPORT_SCORER_ID not set");

    let submission_data = serde_json::json!({
        "address": data.eth_address,
        "scorer_id": scorer_id,
    });

    let client = reqwest::Client::new();
    let res = client
        .post(format!("{api_url}/submit-passport"))
        .header("Content-Type", "application/json")
        .header("X-API-KEY", api_key)
        .json(&submission_data)
        .send()
        .await;

    match res {
        Ok(response) => {
            let json_body = response.text().await.unwrap();
            match serde_json::from_str::<serde_json::Value>(&json_body) {
                Ok(json) => HttpResponse::Ok().json(json),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn get_passport_score(query: web::Query<PassportSubmission>) -> impl Responder {
    let api_url: String =
        std::env::var("GITCOIN_PASSPORT_API_URL").expect("GITCOIN_PASSPORT_API_URL not set");
    let api_key: String =
        std::env::var("GITCOIN_PASSPORT_API_KEY").expect("GITCOIN_PASSPORT_API_KEY not set");
    let scorer_id: String =
        std::env::var("GITCOIN_PASSPORT_SCORER_ID").expect("GITCOIN_PASSPORT_SCORER_ID not set");

    let address = &query.eth_address;

    let client = reqwest::Client::new();
    let res = client
        .get(format!("{api_url}/score/{scorer_id}/{}", *address))
        .header("Content-Type", "application/json")
        .header("X-API-KEY", api_key)
        .send()
        .await;

    match res {
        Ok(response) => {
            let json_body = response.text().await.unwrap();
            match serde_json::from_str::<serde_json::Value>(&json_body) {
                Ok(json) => HttpResponse::Ok().json(json),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
