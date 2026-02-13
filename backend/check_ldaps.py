import os
import ssl
from ldap3 import Server, Connection, ALL, Tls

# Configurações (Pegando do ambiente ou Fallback)
AD_HOST = os.getenv("AD_SERVER", "192.168.0.31").replace("ldap://", "").replace("ldaps://", "").split(":")[0]
AD_PORT = 636 
AD_USER = os.getenv("AD_BIND_USER", "svc_zerocore@mdr.local")
AD_PASS = os.getenv("AD_BIND_PASSWORD", "smdr.12345")

def check_ldaps():
    print(f"\n🔍 TESTE DE CONECTIVIDADE LDAPS (SSL)")
    print(f"======================================")
    print(f"📡 Destino: {AD_HOST}:{AD_PORT}")
    print(f"👤 Usuário de Serviço: {AD_USER}")
    
    tls_config = Tls(validate=ssl.CERT_NONE, version=ssl.PROTOCOL_TLSv1_2)
    
    server = Server(
        AD_HOST, 
        port=AD_PORT, 
        use_ssl=True, 
        get_info=ALL,
        tls=tls_config,
        connect_timeout=5
    )

    print("\n[Etapa 1] Conectando via Socket Seguro...")
    try:
        if server.check_availability():
             print("✅ Conexão TCP/SSL estabelecida!")
        else:
             print("❌ O servidor não responde na porta 636.")
             return
    except Exception as e:
        print(f"❌ Erro de Conexão: {e}")
        return

    print("\n[Etapa 2] Tentando Autenticação de Serviço (Bind)...")
    try:
        with Connection(server, user=AD_USER, password=AD_PASS) as conn:
            if conn.bind():
                print("✅ Login de serviço realizado com sucesso!")
                
                # Teste extra: Buscar um usuário para ver como o e-mail está vindo
                print("\n[Etapa 3] Teste de extração de dados (Ex: marilia.freitas)...")
                conn.search(
                    search_base=os.getenv("AD_BASE_DN", "DC=mdr,DC=local"),
                    search_filter="(&(objectClass=user)(sAMAccountName=marilia.freitas))",
                    attributes=['displayName', 'mail']
                )
                
                if conn.entries:
                    user = conn.entries[0]
                    raw_mail = user.mail.value
                    print(f"   👤 Nome: {user.displayName}")
                    print(f"   📧 E-mail bruto (raw): {raw_mail}")
                    
                    # Demonstração da correção
                    email_final = str(user.mail[0]) if user.mail else None
                    print(f"   ✨ E-mail processado para o Banco: {email_final}")
                    
                    if email_final is None:
                        print("   ⚠️  Usuário sem e-mail detectado. O Banco deve aceitar NULL.")
                else:
                    print("   ℹ️ Usuário de teste 'marilia.freitas' não encontrado para amostragem.")

            else:
                print("❌ Falha no login de serviço (invalidCredentials).")
                print(f"   Dica: Verifique se o usuário '{AD_USER}' e a senha no docker-compose estão 100% corretos.")
    except Exception as e:
        print(f"❌ Erro durante o Bind: {e}")

if __name__ == "__main__":
    check_ldaps()