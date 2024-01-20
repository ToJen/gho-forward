mod database;
mod handlers;
mod models;
mod schema;

use actix_cors::Cors;
use actix_web::{http, web, App, HttpServer};
use database::Database;
use handlers::{get_passport_score, get_signatures_handler, signatures_handler, submit_passport};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db = web::Data::new(Database::new());

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(db.clone()) // Pass the db pool to the handlers
            // .service(web::resource("/chat").route(web::post().to(chat_handler)))
            .service(
                web::resource("/signatures")
                    .route(web::post().to(signatures_handler))
                    .route(web::get().to(get_signatures_handler)),
            )
            .route("/submit_passport", web::post().to(submit_passport))
            .route("/get_passport_score", web::get().to(get_passport_score))
    })
    .bind("0.0.0.0:8000")?
    .run()
    .await
}
