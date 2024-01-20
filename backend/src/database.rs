use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};

use crate::models::{LenderSignature, NewLenderSignature};
use crate::schema::signatures::dsl::*;

use dotenv::dotenv;

pub type DBPool = r2d2::Pool<ConnectionManager<PgConnection>>;

pub struct Database {
    pub pool: DBPool,
}

impl Database {
    pub fn new() -> Self {
        dotenv().ok();
        let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        let manager = ConnectionManager::<PgConnection>::new(database_url);
        let result = r2d2::Pool::builder()
            .build(manager)
            .expect("Failed to create pool.");

        Database { pool: result }
    }

    pub fn get_signatures(&self) -> Vec<LenderSignature> {
        signatures
            .load::<LenderSignature>(&mut self.pool.get().unwrap())
            .expect("Failed to get signatures.")
    }

    pub fn get_signature(&self, find_id: i32) -> Option<LenderSignature> {
        signatures
            .find(find_id)
            .first::<LenderSignature>(&mut self.pool.get().unwrap())
            .ok()
    }

    pub fn get_signature_by_borrower(&self, request_id: i32) -> Option<LenderSignature> {
        signatures
            .filter(borrow_request_id.eq(request_id))
            .first::<LenderSignature>(&mut self.pool.get().unwrap())
            .ok()
    }

    pub fn create_signature(
        &self,
        data: NewLenderSignature,
    ) -> Result<LenderSignature, diesel::result::Error> {
        diesel::insert_into(signatures)
            .values(&data)
            .get_result(&mut self.pool.get().unwrap())
    }

    // pub fn delete_signature(&self, find_id: i32) -> Result<usize, diesel::result::Error> {
    //     diesel::delete(signatures.filter(id.eq(find_id))).execute(&mut self.pool.get().unwrap())
    // }

    // pub fn update_signature(
    //     &self,
    //     data: LenderSignature,
    // ) -> Result<LenderSignature, diesel::result::Error> {
    //     diesel::update(signatures.filter(id.eq(data.id)))
    //         .set(&data)
    //         .get_result(&mut self.pool.get().unwrap())
    // }
}
