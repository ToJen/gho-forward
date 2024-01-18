mod database;
mod handlers;
mod models;
mod schema;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use handlers::{chat_handler, get_signatures_handler, signatures_handler};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(web::resource("/chat").route(web::post().to(chat_handler)))
            .service(web::resource("/signatures").route(web::post().to(signatures_handler)))
            .service(web::resource("/signatures").route(web::get().to(get_signatures_handler)))
    })
    .bind("http://localhost:8000")?
    .run()
    .await
}
