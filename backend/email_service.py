import os
import logging
import resend
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EmailService")

resend.api_key = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "PsiCore <onboarding@resend.dev>")

YEAR = datetime.now().year

def _base(content: str) -> str:
    return f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<!-- HEADER -->
<tr><td style="background:linear-gradient(135deg,#0284C7,#0369A1);padding:28px 40px;text-align:center;">
  <span style="font-size:26px;font-weight:800;color:#fff;">🧠 PsiCore</span>
  <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Sistema de Gestão para Psicólogos</p>
</td></tr>
<!-- BODY -->
<tr><td style="padding:36px 40px;">{content}</td></tr>
<!-- FOOTER -->
<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;">
  <p style="margin:0;font-size:12px;color:#94A3B8;">E-mail automático — não responda.<br>© {YEAR} PsiCore. Todos os direitos reservados.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>"""


def _send(to: str, subject: str, html: str):
    if not resend.api_key:
        logger.warning(f"[MOCK] Para: {to} | Assunto: {subject}")
        return
    if not to:
        return
    try:
        response = resend.Emails.send({"from": EMAIL_FROM, "to": [to], "subject": subject, "html": html})
        logger.info(f"E-mail enviado! ID: {response['id']} → {to}")
    except Exception as e:
        logger.error(f"Erro ao enviar para {to}: {e}")


def send_welcome_email(patient_name=None, patient_email=None, psychologist_name=None, psychologist_email=None):
    if psychologist_email and psychologist_name:
        content = f"""
<h2 style="margin:0 0 8px;font-size:22px;color:#0F172A;">Bem-vindo, {psychologist_name}! 🎉</h2>
<p style="color:#64748B;margin:0 0 24px;">Sua conta foi criada com sucesso no PsiCore.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px;">
<tr><td>
  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0F172A;text-transform:uppercase;letter-spacing:0.05em;">O que você pode fazer:</p>
  <p style="margin:4px 0;font-size:14px;color:#334155;">📅 Gerenciar sua agenda e agendamentos</p>
  <p style="margin:4px 0;font-size:14px;color:#334155;">👥 Cadastrar e acompanhar seus pacientes</p>
  <p style="margin:4px 0;font-size:14px;color:#334155;">📋 Criar e manter prontuários eletrônicos</p>
  <p style="margin:4px 0;font-size:14px;color:#334155;">💰 Controlar o financeiro da sua clínica</p>
  <p style="margin:4px 0;font-size:14px;color:#334155;">📊 Gerar relatórios de atendimentos</p>
</td></tr>
</table>
<div style="text-align:center;">
  <a href="http://localhost:5173/login" style="display:inline-block;background:#0284C7;color:#fff;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;font-size:15px;">Acessar minha conta →</a>
</div>"""
        _send(psychologist_email, f"Bem-vindo ao PsiCore, {psychologist_name}!", _base(content))

    elif patient_email and patient_name:
        psico = f"<strong style='color:#0284C7;'>{psychologist_name}</strong>" if psychologist_name else "seu psicólogo(a)"
        content = f"""
<h2 style="margin:0 0 8px;font-size:22px;color:#0F172A;">Olá, {patient_name}! 👋</h2>
<p style="color:#64748B;margin:0 0 20px;">Você foi cadastrado(a) no sistema PsiCore pelo(a) psicólogo(a) {psico}.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF6FF;border-left:4px solid #0284C7;border-radius:0 8px 8px 0;padding:16px;margin-bottom:8px;">
<tr><td><p style="margin:0;font-size:14px;color:#1E40AF;line-height:1.6;">Seu acompanhamento psicológico agora conta com um sistema digital seguro. Seus dados são acessíveis apenas ao seu profissional responsável.</p></td></tr>
</table>"""
        _send(patient_email, "Você foi cadastrado(a) no PsiCore", _base(content))


def send_appointment_email(patient_name: str, patient_email: str, date_time: str, psychologist_name: str = None):
    try:
        dt = datetime.fromisoformat(date_time.replace("Z", "+00:00"))
        date_fmt = dt.strftime("%d/%m/%Y")
        time_fmt = dt.strftime("%H:%M")
    except Exception:
        date_fmt = date_time
        time_fmt = ""

    psico = f"<strong style='color:#0284C7;'>{psychologist_name}</strong>" if psychologist_name else "seu psicólogo(a)"
    psico_row = f"<tr><td style='padding:8px 0;'><span style='font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;'>👤 Profissional</span><br><span style='font-size:16px;font-weight:600;color:#0F172A;'>{psychologist_name}</span></td></tr>" if psychologist_name else ""

    content = f"""
<h2 style="margin:0 0 8px;font-size:22px;color:#0F172A;">Consulta Confirmada! ✅</h2>
<p style="color:#64748B;margin:0 0 24px;">Olá, <strong>{patient_name}</strong>! Sua consulta com {psico} foi agendada.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:12px;padding:20px;margin-bottom:20px;">
<tr><td>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:8px 0;border-bottom:1px solid #E0F2FE;">
      <span style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;">📅 Data</span><br>
      <span style="font-size:20px;font-weight:700;color:#0F172A;">{date_fmt}</span>
    </td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #E0F2FE;">
      <span style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;">⏰ Horário</span><br>
      <span style="font-size:20px;font-weight:700;color:#0F172A;">{time_fmt}</span>
    </td></tr>
    {psico_row}
  </table>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border-left:4px solid #F59E0B;border-radius:0 8px 8px 0;padding:14px;">
<tr><td><p style="margin:0;font-size:13px;color:#92400E;">⚠️ <strong>Lembrete:</strong> Em caso de cancelamento, avise com pelo menos 24 horas de antecedência.</p></td></tr>
</table>"""
    _send(patient_email, f"Consulta confirmada — {date_fmt} às {time_fmt}", _base(content))


def send_cancellation_email(patient_name: str, patient_email: str, date_time: str, psychologist_name: str = None):
    try:
        dt = datetime.fromisoformat(date_time.replace("Z", "+00:00"))
        date_fmt = dt.strftime("%d/%m/%Y")
        time_fmt = dt.strftime("%H:%M")
    except Exception:
        date_fmt = date_time
        time_fmt = ""

    psico = f"<strong style='color:#0284C7;'>{psychologist_name}</strong>" if psychologist_name else "seu psicólogo(a)"
    psico_row = f"<tr><td style='padding:8px 0;'><span style='font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;'>👤 Profissional</span><br><span style='font-size:16px;font-weight:600;color:#0F172A;'>{psychologist_name}</span></td></tr>" if psychologist_name else ""

    content = f"""
<h2 style="margin:0 0 8px;font-size:22px;color:#EF4444;">Consulta Cancelada ❌</h2>
<p style="color:#64748B;margin:0 0 24px;">Olá, <strong>{patient_name}</strong>. Sua consulta com {psico} foi <strong style="color:#EF4444;">cancelada</strong>.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;margin-bottom:20px;">
<tr><td>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:8px 0;border-bottom:1px solid #FEE2E2;">
      <span style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;">📅 Data</span><br>
      <span style="font-size:20px;font-weight:700;color:#0F172A;text-decoration:line-through;">{date_fmt}</span>
    </td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #FEE2E2;">
      <span style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;">⏰ Horário</span><br>
      <span style="font-size:20px;font-weight:700;color:#0F172A;text-decoration:line-through;">{time_fmt}</span>
    </td></tr>
    {psico_row}
  </table>
</td></tr>
</table>
<p style="font-size:14px;color:#475569;margin:0;">Para agendar um novo horário, por favor entre em contato.</p>"""
    _send(patient_email, f"Consulta Cancelada — {date_fmt}", _base(content))


def send_birthday_email(patient_name: str, patient_email: str, psychologist_name: str = None):
    psico_name = psychologist_name if psychologist_name else "a equipe PsiCore"
    content = f"""
<div style="text-align:center;">
<span style="font-size:48px;display:block;margin-bottom:16px;">🎂</span>
<h2 style="margin:0 0 8px;font-size:24px;color:#0F172A;">Feliz Aniversário, {patient_name}! 🎉</h2>
<p style="color:#64748B;margin:0 0 20px;font-size:16px;line-height:1.6;">
Neste dia especial, eu {psico_name} gostaria de te desejar muita saúde, paz e realizações. Que este novo ciclo traga muitas coisas boas e evolução para a sua vida.
</p>
<p style="font-size:16px;color:#0284C7;font-weight:600;margin:0;">Parabéns!</p>
</div>"""
    _send(patient_email, f"Feliz Aniversário, {patient_name}! 🎉", _base(content))


def send_block_email(user_name: str, user_email: str):
    content = f"""
<h2 style="margin:0 0 8px;font-size:22px;color:#EF4444;">Acesso Suspenso</h2>
<p style="color:#64748B;margin:0 0 20px;">Olá, <strong>{user_name}</strong>. Seu acesso ao PsiCore foi temporariamente <strong style="color:#EF4444;">suspenso</strong>.</p>
<p style="font-size:14px;color:#475569;margin:0;">Para regularizar sua situação, entre em contato com o suporte.</p>"""
    _send(user_email, "Seu acesso ao PsiCore foi suspenso", _base(content))


def send_unblock_email(user_name: str, user_email: str):
    content = f"""
<h2 style="margin:0 0 8px;font-size:22px;color:#10B981;">Acesso Reativado! ✅</h2>
<p style="color:#64748B;margin:0 0 24px;">Olá, <strong>{user_name}</strong>! Seu acesso ao PsiCore foi <strong style="color:#10B981;">reativado</strong>.</p>
<div style="text-align:center;">
  <a href="http://localhost:5173/login" style="display:inline-block;background:#10B981;color:#fff;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;font-size:15px;">Acessar o PsiCore →</a>
</div>"""
    _send(user_email, "Seu acesso ao PsiCore foi reativado! 🎉", _base(content))


def send_support_email(user_name: str, user_email: str, message: str):
    admin_email = "dennis.w.garcia@gmail.com"
    content = f"""
<h2 style="margin:0 0 8px;font-size:22px;color:#0F172A;">Novo Chamado de Suporte 🆘</h2>
<p style="color:#64748B;margin:0 0 24px;">O usuário <strong>{user_name}</strong> enviou uma nova mensagem.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:20px;">
<tr><td>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:8px 0;border-bottom:1px solid #E2E8F0;">
      <span style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;">Nome do Psicólogo</span><br>
      <span style="font-size:16px;font-weight:600;color:#0F172A;">{user_name}</span>
    </td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #E2E8F0;">
      <span style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;">E-mail</span><br>
      <span style="font-size:16px;font-weight:600;color:#0F172A;">{user_email}</span>
    </td></tr>
    <tr><td style="padding:16px 0 0 0;">
      <span style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;">Mensagem</span><br>
      <p style="font-size:15px;color:#334155;line-height:1.6;margin:8px 0 0 0;white-space:pre-wrap;">{message}</p>
    </td></tr>
  </table>
</td></tr>
</table>"""
    _send(admin_email, f"Suporte PsiCore - {user_name}", _base(content))
