mod database;
mod handlers;
mod models;
mod schema;

use actix_web::{web, App, HttpServer};
use database::Database;
use handlers::{get_signatures_handler, signatures_handler};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db = web::Data::new(Database::new());

    HttpServer::new(move || {
        App::new()
            .app_data(db.clone()) // Pass the db pool to the handlers
            // .service(web::resource("/chat").route(web::post().to(chat_handler)))
            .service(
                web::resource("/signatures")
                    .route(web::post().to(signatures_handler))
                    .route(web::get().to(get_signatures_handler)),
            )
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await
}
