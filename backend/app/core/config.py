from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Allow extra env vars without validation error
    )

    # Database
    database_url: str

    # Neon Auth
    neon_auth_secret: str = ""

    # AI
    gemini_api_key: str = ""

    # Cloudflare Workers AI
    cf_account_id: str = ""
    cf_api_token: str = ""

    # VAPID Push Notifications
    vapid_private_key: str = ""
    vapid_public_key: str = ""
    vapid_email: str = "mailto:admin@qazatracker.com"

    # Resend Email Integration
    resend_api_key: str = ""
    email_from: str = "Qaza Tracker <onboarding@resend.dev>"

    # App
    frontend_url: str = "http://localhost:5173"
    environment: str = "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


settings = Settings()
