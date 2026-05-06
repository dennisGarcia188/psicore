import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EmailServiceMock")

def send_welcome_email(patient_name: str, patient_email: str):
    """
    Simula o envio de um e-mail de boas-vindas para um novo paciente.
    Em produção, aqui estaria a integração com AWS SES ou Resend.
    """
    if not patient_email:
        logger.warning(f"O paciente {patient_name} não tem e-mail cadastrado. E-mail cancelado.")
        return
        
    logger.info(f"Conectando ao servidor SMTP (Simulado)...")
    time.sleep(2) # Simula o delay da rede
    
    html_content = f"""
    Olá {patient_name},
    
    Seja bem-vindo(a) ao seu novo portal de acompanhamento psicológico.
    
    Atenciosamente,
    Equipe PsiCore.
    """
    logger.info(f"--- E-MAIL ENVIADO COM SUCESSO ---")
    logger.info(f"Para: {patient_email}")
    logger.info(f"Assunto: Bem-vindo(a) à Clínica!")
    logger.info(f"Corpo: {html_content}")
    logger.info(f"---------------------------------")


def send_appointment_email(patient_name: str, patient_email: str, date_time: str):
    """
    Simula o envio de um e-mail de confirmação de agendamento.
    """
    if not patient_email:
        return
        
    logger.info(f"Conectando ao servidor SMTP (Simulado)...")
    time.sleep(2)
    
    logger.info(f"--- E-MAIL DE AGENDAMENTO ENVIADO ---")
    logger.info(f"Para: {patient_email}")
    logger.info(f"Assunto: Confirmação de Consulta")
    logger.info(f"Corpo: Olá {patient_name}, sua consulta foi agendada para {date_time}.")
    logger.info(f"-------------------------------------")
