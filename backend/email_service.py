import os
import logging
import resend

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EmailService")

resend.api_key = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "PsiCore <onboarding@resend.dev>")


def _send(to: str, subject: str, html: str):
    """Função central de envio. Se a API key não estiver configurada, faz mock no console."""
    if not resend.api_key:
        logger.warning(f"[MOCK] Para: {to} | Assunto: {subject}")
        return

    if not to:
        logger.warning(f"Destinatário vazio, e-mail cancelado: {subject}")
        return

    try:
        params: resend.Emails.SendParams = {
            "from": EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        response = resend.Emails.send(params)
        logger.info(f"E-mail enviado com sucesso! ID: {response['id']}")
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail para {to}: {e}")


def send_welcome_email(patient_name: str = None, patient_email: str = None, psychologist_name: str = None, psychologist_email: str = None):
    """
    Chamada ao registrar um novo psicólogo OU um novo paciente.
    Se patient_email for fornecido, envia boas-vindas ao paciente.
    Se psychologist_email for fornecido, envia boas-vindas ao psicólogo.
    """
    if psychologist_email:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0284C7;">Bem-vindo ao PsiCore! 🧠</h1>
          <p>Olá, <strong>{psychologist_name}</strong>!</p>
          <p>Sua conta foi criada com sucesso. Agora você tem acesso a um sistema completo para gerenciar sua clínica de psicologia.</p>
          <ul>
            <li>📅 Agenda integrada</li>
            <li>👥 Gestão de pacientes</li>
            <li>📋 Prontuários eletrônicos</li>
            <li>💰 Controle financeiro</li>
          </ul>
          <p style="margin-top: 24px;">
            <a href="http://localhost:5174/dashboard" style="background-color: #0284C7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              Acessar minha conta
            </a>
          </p>
          <p style="color: #64748B; font-size: 12px; margin-top: 32px;">© 2026 PsiCore. Todos os direitos reservados.</p>
        </div>
        """
        _send(psychologist_email, "Bem-vindo ao PsiCore!", html)

    elif patient_email:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0284C7;">Olá, {patient_name}! 👋</h1>
          <p>Você foi cadastrado(a) no sistema de gestão clínica PsiCore.</p>
          <p>Seu acompanhamento psicológico agora conta com um sistema digital seguro e organizado.</p>
          <p style="color: #64748B; font-size: 12px; margin-top: 32px;">© 2026 PsiCore. Todos os direitos reservados.</p>
        </div>
        """
        _send(patient_email, "Você foi cadastrado(a) no PsiCore", html)


def send_appointment_email(patient_name: str, patient_email: str, date_time: str):
    """Envia confirmação de agendamento para o paciente."""
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0284C7;">Consulta Agendada ✅</h1>
      <p>Olá, <strong>{patient_name}</strong>!</p>
      <p>Sua consulta foi agendada com sucesso.</p>
      <div style="background-color: #F8FAFC; padding: 16px; border-radius: 8px; border-left: 4px solid #0284C7; margin: 20px 0;">
        <p style="margin: 0;"><strong>📅 Data e Hora:</strong> {date_time}</p>
      </div>
      <p>Em caso de dúvidas ou necessidade de remarcação, entre em contato com seu psicólogo.</p>
      <p style="color: #64748B; font-size: 12px; margin-top: 32px;">© 2026 PsiCore. Todos os direitos reservados.</p>
    </div>
    """
    _send(patient_email, "Confirmação de Consulta - PsiCore", html)
