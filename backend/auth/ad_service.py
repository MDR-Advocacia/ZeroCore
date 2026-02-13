import os
import re
from ldap3 import Server, Connection, ALL, SUBTREE
from typing import Optional, List, Dict

# Configurações do AD
AD_SERVER = os.getenv("AD_SERVER", "ldap://192.168.0.31")
AD_DOMAIN = os.getenv("AD_DOMAIN", "mdr.local")
AD_BASE_DN = os.getenv("AD_BASE_DN", "DC=mdr,DC=local")
AD_BIND_USER = os.getenv("AD_BIND_USER") 
AD_BIND_PASSWORD = os.getenv("AD_BIND_PASSWORD")

class ADService:
    @staticmethod
    def _format_dept_name(raw_name: str) -> str:
        name = raw_name.replace("ZC_DEPT_", "").replace("_", " ")
        return name.title()

    @staticmethod
    def authenticate(username: str, password: str) -> Optional[Dict]:
        user_dn = f"{username}@{AD_DOMAIN}"
        server = Server(AD_SERVER, get_info=ALL)
        
        try:
            with Connection(server, user=user_dn, password=password, auto_bind=True) as conn:
                search_filter = f"(&(objectClass=user)(sAMAccountName={username}))"
                conn.search(
                    search_base=AD_BASE_DN,
                    search_filter=search_filter,
                    search_scope=SUBTREE,
                    attributes=['displayName', 'mail', 'memberOf', 'title', 'department', 'distinguishedName']
                )
                
                if not conn.entries:
                    return None
                
                user_data = conn.entries[0]
                
                # --- CORREÇÃO DO E-MAIL (O problema do '[]') ---
                # Se user_data.mail estiver vazio, retornamos None (NULL no banco)
                # Se tiver, pegamos o primeiro item da lista.
                email_address = str(user_data.mail[0]) if user_data.mail else None
                
                groups = [str(g).split(',')[0].split('=')[1] for g in user_data.memberOf] if 'memberOf' in user_data else []
                role = ADService._resolve_role(groups)
                
                departments = []
                for g in groups:
                    if g.startswith("ZC_DEPT_"):
                        departments.append(ADService._format_dept_name(g))
                
                if not departments and user_data.distinguishedName:
                     ou_dept = ADService._extract_ou_dept(str(user_data.distinguishedName))
                     if ou_dept: departments.append(ou_dept)
                
                if not departments:
                    departments = ["Geral"]

                # Regras de Permissões
                permissions = []
                if role in ["admin", "diretoria", "coordenador"] or any(d in ["RH", "TI", "Marketing"] for d in departments):
                    permissions.append("post_general")

                return {
                    "username": username,
                    "full_name": str(user_data.displayName),
                    "email": email_address, # Agora vai None ou String real, nunca '[]'
                    "role": role,
                    "depts": departments,
                    "permissions": permissions,
                    "location": "Matriz",
                    "title": str(user_data.title) if user_data.title else "Colaborador",
                    "is_admin": role == "admin"
                }
        except Exception as e:
            print(f"Erro AD Auth: {e}")
            return None

    @staticmethod
    def list_all_departments() -> List[str]:
        if not AD_BIND_USER or not AD_BIND_PASSWORD: return []
        server = Server(AD_SERVER, get_info=ALL)
        departments = set()
        try:
            with Connection(server, user=AD_BIND_USER, password=AD_BIND_PASSWORD, auto_bind=True) as conn:
                conn.search(search_base=AD_BASE_DN, search_filter="(&(objectClass=group)(cn=ZC_DEPT_*))", attributes=['cn'])
                for entry in conn.entries:
                    departments.add(ADService._format_dept_name(str(entry.cn)))
                return sorted(list(departments))
        except Exception:
            return []

    @staticmethod
    def _resolve_role(groups: List[str]) -> str:
        hierarchy = [("ZC_ROLE_ADMIN", "admin"), ("ZC_ROLE_DIRETORIA", "diretoria"), ("ZC_ROLE_COORDENADOR", "coordenador"), ("ZC_ROLE_SUPERVISOR", "supervisor")]
        for p, r in hierarchy:
            if p in groups: return r
        return "admin" if "Domain Admins" in groups else "user"

    @staticmethod
    def _extract_ou_dept(dn: str) -> Optional[str]:
        match = re.search(r'OU=([^,]+)', dn)
        if match:
            ou_name = match.group(1)
            if ou_name not in ["Users", "Groups", "Computers", "MDR"]: return ou_name
        return None