import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD


def send_verification_email(to_email: str, verification_link: str):
    subject = "Подтверждение аккаунта"
    body = f"""
    Привет!

    Чтобы подтвердить аккаунт, перейди по ссылке:

    {verification_link}

    Если ты не регистрировался, просто проигнорируй это письмо.
    """

    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain", "utf-8"))

    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASSWORD)
    server.sendmail(SMTP_USER, to_email, msg.as_string())
    server.quit()