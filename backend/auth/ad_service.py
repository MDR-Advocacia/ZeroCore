import os
import re
from ldap3 import Server, Connection, ALL, SUBTREE
from typing import Optional, List, Dict

# Configurações do AD vindas do ambiente
AD_SERVER = os.getenv("AD_SERVER", "ldap://192.168.0.31") # Aspas corrigidas aqui
AD_DOMAIN = os.getenv("AD_DOMAIN", "mdr.local")
AD_BASE_DN = os.getenv("AD_BASE_DN", "DC=mdr,DC=local")

class ADService:
    @staticmethod
    def authenticate(username: str, password: str) -> Optional[Dict]:
        """
        Autentica no AD e extrai a matriz: Role, Setor e Localização (Informativo).
        """
        user_dn = f"{username}@{AD_DOMAIN}"
        server = Server(AD_SERVER, get_info=ALL)
        
        try:
            with Connection(server, user=user_dn, password=password, auto_bind=True) as conn:
                search_filter = f"(&(objectClass=user)(sAMAccountName={username}))"
                conn.search(
                    search_base=AD_BASE_DN,
                    search_filter=search_filter,
                    search_scope=SUBTREE,
                    attributes=['displayName', 'mail', 'memberOf', 'title', 'department', 'description']
                )
                
                if not conn.entries:
                    return None
                
                user_data = conn.entries[0]
                groups = []
                if 'memberOf' in user_data:
                    for group_dn in user_data.memberOf:
                        match = re.search(r'CN=([^,]+)', group_dn)
                        if match:
                            groups.append(match.group(1))

                # 1. Resolução de Role (Hierarquia MDR)
                role = ADService._resolve_role(groups)
                
                # 2. Resolução de Setores (ZC_DEPT_)
                departments = [g.replace("ZC_DEPT_", "") for g in groups if g.startswith("ZC_DEPT_")]
                
                # 3. Resolução de Localização (Apenas informativo)
                locations = [g.replace("ZC_LOC_", "") for g in groups if g.startswith("ZC_LOC_")]
                location_info = locations[0] if locations else "Matriz"

                return {
                    "username": username,
                    "full_name": str(user_data.displayName),
                    "email": str(user_data.mail),
                    "role": role,
                    "departments": departments if departments else [str(user_data.department or "Geral")],
                    "location": location_info,
                    "title": str(user_data.title) if user_data.title else "Colaborador",
                    "cpf": str(user_data.description) if user_data.description else None,
                    "is_admin": role == "admin"
                }
        except Exception:
            return None

    @staticmethod
    def _resolve_role(groups: List[str]) -> str:
        """
        Mapeia os grupos ZC_ROLE para as roles internas do ZeroCore.
        """
        hierarchy = [
            ("ZC_ROLE_ADMIN", "admin"),
            ("ZC_ROLE_DIRETORIA", "diretoria"),
            ("ZC_ROLE_COORDENADOR", "coordenador"),
            ("ZC_ROLE_SUPERVISOR", "supervisor"),
            ("ZC_ROLE_ADVOGADO", "advogado"),
            ("ZC_ROLE_ESTAGIARIO", "estagiario"),
        ]

        for group_prefix, role_name in hierarchy:
            if group_prefix in groups:
                return role_name
        
        if "Domain Admins" in groups or "MDR_TI" in groups:
            return "admin"
        
        return "user"