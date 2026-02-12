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
        """
        Transforma 'ZC_DEPT_AUTOR_BB_PROCESSUAL' em 'Autor Bb Processual'.
        Remove prefixos, troca underlines por espaços e capitaliza.
        """
        # 1. Remove o prefixo se existir
        name = raw_name.replace("ZC_DEPT_", "")
        
        # 2. Troca _ por espaço
        name = name.replace("_", " ")
        
        # 3. Capitalização Inteligente (Title Case)
        # Ex: FINANCEIRO -> Financeiro | AUTOR_BB_PROCESSUAL -> Autor Bb Processual
        return name.title()

    @staticmethod
    def authenticate(username: str, password: str) -> Optional[Dict]:
        user_dn = f"{username}@{AD_DOMAIN}"
        server = Server(AD_SERVER, get_info=ALL)
        debug_log = [f"\n🔍 [DEBUG AD] Rastreamento: {username}"]
        
        try:
            with Connection(server, user=user_dn, password=password, auto_bind=True) as conn:
                search_filter = f"(&(objectClass=user)(sAMAccountName={username}))"
                conn.search(
                    search_base=AD_BASE_DN,
                    search_filter=search_filter,
                    search_scope=SUBTREE,
                    attributes=['displayName', 'mail', 'memberOf', 'title', 'department', 'distinguishedName']
                )
                
                if not conn.entries: return None
                user_data = conn.entries[0]
                
                # --- Grupos ---
                groups = [str(g).split(',')[0].split('=')[1] for g in user_data.memberOf] if 'memberOf' in user_data else []
                role = ADService._resolve_role(groups)
                
                # --- Departamentos (Com Formatação) ---
                departments = []
                
                # A: Grupos ZC_DEPT_ (Formatados)
                for g in groups:
                    if g.startswith("ZC_DEPT_"):
                        # Aplica a formatação aqui!
                        formatted_name = ADService._format_dept_name(g)
                        if formatted_name not in departments:
                            departments.append(formatted_name)

                # B: Pastas OU
                if user_data.distinguishedName:
                     ou_dept = ADService._extract_ou_dept(str(user_data.distinguishedName))
                     if ou_dept and ou_dept not in departments:
                         departments.append(ou_dept) # OUs já costumam ter nomes bonitos, mas poderia formatar se necessário
                
                # C: Fallback Texto
                if not departments and user_data.department:
                    departments.append(str(user_data.department).title()) # Aplica title() no fallback também

                if not departments: departments = ["Geral"]

                debug_log.append(f"   🏢 SETORES FORMATADOS: {departments}")

                # --- Permissões (Regra de Ouro) ---
                permissions = []
                
                # 1. Quem pode postar GERAL?
                # Regra: RH, TI, Marketing, Coordenadores e Diretores
                # Verificamos ROLE ou SETOR
                is_management = role in ["admin", "diretoria", "coordenador"]
                is_comms_dept = any(d in ["RH", "Marketing", "Comunicação", "TI"] for d in departments) # Adicionado TI aqui
                has_comms_group = "ZC_PERM_COMMS" in groups

                if is_management or is_comms_dept or has_comms_group:
                    permissions.append("post_general")
                
                # 2. Permissões Técnicas
                if "ZC_PERM_TECH_ADMIN" in groups or "TI" in departments:
                    permissions.append("post_tech")
                
                # 5. Localização
                locations = [g.replace("ZC_LOC_", "") for g in groups if g.startswith("ZC_LOC_")]
                location_info = locations[0] if locations else "Matriz"

                print("\n".join(debug_log))
                print("-" * 50)

                return {
                    "username": username,
                    "full_name": str(user_data.displayName),
                    "email": str(user_data.mail),
                    "role": role,
                    "depts": departments,
                    "permissions": permissions,
                    "location": location_info,
                    "title": str(user_data.title) if user_data.title else "Colaborador",
                    "is_admin": role == "admin"
                }
        except Exception as e:
            print(f"❌ Erro Crítico AD Auth: {e}")
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
                    raw_name = str(entry.cn)
                    # Aplica a mesma formatação na lista geral
                    formatted = ADService._format_dept_name(raw_name)
                    departments.add(formatted)
                return sorted(list(departments))
        except Exception as e:
            print(f"❌ Erro lista depts: {e}")
            return []

    @staticmethod
    def _resolve_role(groups: List[str]) -> str:
        hierarchy = [
            ("ZC_ROLE_ADMIN", "admin"),
            ("ZC_ROLE_DIRETORIA", "diretoria"),
            ("ZC_ROLE_COORDENADOR", "coordenador"),
            ("ZC_ROLE_SUPERVISOR", "supervisor"),
            ("ZC_ROLE_ADVOGADO", "advogado"),
            ("ZC_ROLE_ESTAGIARIO", "estagiario"),
        ]
        for p, r in hierarchy:
            if p in groups: return r
        if "Domain Admins" in groups: return "admin"
        return "user"

    @staticmethod
    def _extract_ou_dept(dn: str) -> Optional[str]:
        match = re.search(r'OU=([^,]+)', dn)
        if match:
            name = match.group(1).replace("_", " ") # Remove underline de OUs também
            if name not in ["Users", "Groups", "Computers", "Domain Controllers", "Matriz", "Filiais"]:
                return name
        return None