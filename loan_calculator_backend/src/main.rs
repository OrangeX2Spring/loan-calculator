use actix_cors::Cors;
use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct LoanRequest {
    amount: f64,
    rate: f64,
    years: u32,
}

#[derive(Serialize)]
struct MonthlyData {
    month: u32,
    principal: f64,
    interest: f64,
}

#[derive(Serialize)]
struct LoanResponse {
    monthly_payment: f64,
    total_payment: f64,
    data: Vec<MonthlyData>,
}

// Loan calculation function
fn calculate_loan(amount: f64, rate: f64, years: u32) -> LoanResponse {
    let months = years * 12;
    let monthly_rate = rate / 100.0 / 12.0;
    let monthly_payment = (amount * monthly_rate * (1.0 + monthly_rate).powf(months as f64))
        / ((1.0 + monthly_rate).powf(months as f64) - 1.0);
    let total_payment = monthly_payment * months as f64;

    let mut remaining_balance = amount;
    let mut monthly_data = Vec::new();

    for month in 1..=months {
        let interest_payment = remaining_balance * monthly_rate;
        let principal_payment = monthly_payment - interest_payment;
        remaining_balance -= principal_payment;
        monthly_data.push(MonthlyData {
            month,
            principal: principal_payment,
            interest: interest_payment,
        });
    }

    LoanResponse {
        monthly_payment,
        total_payment,
        data: monthly_data,
    }
}

// API handler
async fn loan_handler(req: web::Query<LoanRequest>) -> impl Responder {
    let response = calculate_loan(req.amount, req.rate, req.years);
    HttpResponse::Ok().json(response)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin() // Allows all origins
                    .allow_any_method()
                    .allow_any_header(),
            )
            .route("/calculate-loan", web::get().to(loan_handler))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}