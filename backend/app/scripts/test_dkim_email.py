import smtplib
import dkim
from email.mime.text import MIMEText
from jinja2 import Template

# Загрузка приватного ключа DKIM из файла (указываем путь к файлу)
with open('/root/rezynt.com.private', 'r') as f:
    dkim_private_key = f.read()

html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Подтверждение регистрации</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:20px">
<h1 style="color:#4CAF50;text-align:center;margin-bottom:30px">Добро пожаловать в Rezynt!</h1>
<h2 style="color:#333">Подтвердите ваш email</h2>
<p>Спасибо за регистрацию! Для завершения процесса регистрации, пожалуйста, подтвердите ваш email адрес.</p>
<p style="text-align:center;margin:30px 0">
<a href="{{ api_url }}/auth/confirm-email?token={{ token }}" style="display:inline-block;padding:12px 24px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:4px;font-weight:bold">Подтвердить email</a>
</p>
<p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:20px 0">{{ api_url }}/auth/confirm-email?token={{ token }}</p>
<p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
<p style="text-align:center;color:#666;font-size:12px;margin-top:30px">&copy; 2025 Rezynt. Все права защищены.</p>
</div>
</body>
</html>
"""

html_content = Template(html_content).render(
            api_url="https://rezynt.com",
            token='1234567890'
        )

msg = MIMEText(html_content, 'html')
msg['From'] = 'team@rezynt.com'
msg['To'] = 'pikulin.ivan.pelikan@gmail.com'
msg['Subject'] = 'Test email with DKIM'

# Заголовки, которые надо подписать
headers = [b"from", b"to", b"subject"]

# Создаем DKIM-подпись
signature = dkim.sign(
    message=msg.as_bytes(),
    selector=b"mail",        # селектор из DNS записи DKIM
    domain=b"rezynt.com",       # домен отправителя
    privkey=dkim_private_key.encode(),
    include_headers=headers
)

# Добавляем DKIM-подпись в заголовки письма
sig_header = signature[len("DKIM-Signature: "):].decode()
msg['DKIM-Signature'] = sig_header

# Отправка письма через smtplib с SSL
with smtplib.SMTP_SSL('smtp.timeweb.ru', 465) as smtp:
    # Аутентификация на SMTP сервере
    smtp.login('team@rezynt.com', 't1ltbpvn69')
    smtp.sendmail(msg['From'], [msg['To']], msg.as_string())
