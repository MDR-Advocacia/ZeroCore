import os
import re
from ldap3 import Server, Connection, ALL, MODIFY_ADD, MODIFY_DELETE
from typing import Optional, List, Dict

AD_SERVER = os.getenv("AD_SERVER", "ldap://192.168.0.31")
AD_DOMAIN = os.getenv("AD_DOMAIN", "mdr.local")
AD_BASE_DN = os.getenv("AD_BASE_DN", "DC=mdr,DC=local")
AD_BIND_USER = os.getenv("AD_BIND_USER") 
AD_BIND_PASSWORD = os.getenv("AD_BIND_PASSWORD")

# Pasta onde os grupos serão criados (Baseado no seu print)
# MDR -> 98_Grupos -> Seguranca
GROUPS_OU = f"OU=Seguranca,OU=98_Grupos,OU=MDR,{AD_BASE_DN}"

class ADService:
    @staticmethod
    def _normalize_dept(name: str) -> str:
        if not name or name.upper() in ["NÃO INFORMADO", "NAO INFORMADO", "NULL", "NONE", "GERAL"]:
            return "GERAL"
        clean = name.replace("ZC_DEPT_", "").replace("_", " ")
        return re.sub(r'\s+', ' ', clean).strip().upper()

    @staticmethod
    def _get_conn():
        server = Server(AD_SERVER, get_info=ALL)
        # auto_bind=True já faz o login
        return Connection(server, user=AD_BIND_USER, password=AD_BIND_PASSWORD, auto_bind=True)

    @staticmethod
    def ensure_group_exists(dept_name: str):
        """Busca o grupo no AD. Se não existir, cria na OU de segurança."""
        dept_name = ADService._normalize_dept(dept_name)
        if dept_name == "GERAL": return None

        group_cn = f"ZC_DEPT_{dept_name.replace(' ', '_').upper()}"
        group_dn = f"CN={group_cn},{GROUPS_OU}"
        
        try:
            with ADService._get_conn() as conn:
                conn.search(AD_BASE_DN, f"(&(objectClass=group)(cn={group_cn}))", attributes=['distinguishedName'])
                if conn.entries:
                    return conn.entries[0].distinguishedName.value
                
                # Tenta criar se não existir
                success = conn.add(group_dn, attributes={
                    'objectClass': ['top', 'group'],
                    'sAMAccountName': group_cn,
                    'description': f'Setor ZeroCore: {dept_name}'
                })
                
                if success:
                    print(f"✅ Grupo {group_cn} criado com sucesso em {GROUPS_OU}")
                    return group_dn
                else:
                    print(f"❌ Falha ao criar grupo {group_cn}: {conn.result.get('description')}")
                    return None
        except Exception as e:
            print(f"💥 Erro fatal ao gerenciar grupo no AD: {e}")
            return None

    @staticmethod
    def set_user_groups(username: str, depts: List[str]):
        """Vincula o usuário aos grupos ZC_DEPT no AD."""
        try:
            with ADService._get_conn() as conn:
                # 1. Busca DN real do usuário
                conn.search(AD_BASE_DN, f"(&(objectClass=user)(sAMAccountName={username}))", attributes=['distinguishedName', 'memberOf'])
                if not conn.entries: 
                    print(f"👤 Usuário {username} não encontrado no AD.")
                    return
                
                user_entry = conn.entries[0]
                user_dn = user_entry.distinguishedName.value
                # Pega apenas os nomes dos grupos (CN)
                current_groups_dn = [str(g) for g in user_entry.memberOf] if 'memberOf' in user_entry else []
                current_groups_cn = [dn.split(',')[0].split('=')[1].upper() for dn in current_groups_dn]
                
                # 2. Prepara lista de grupos alvo (apenas os que não são GERAL)
                target_depts = [ADService._normalize_dept(d) for d in depts if ADService._normalize_dept(d) != "GERAL"]
                target_groups_cn = [f"ZC_DEPT_{d.replace(' ', '_')}" for d in target_depts]
                
                # 3. Remover de grupos ZC que não estão mais na lista
                for g_dn in current_groups_dn:
                    g_cn = g_dn.split(',')[0].split('=')[1].upper()
                    if g_cn.startswith("ZC_DEPT_") and g_cn not in target_groups_cn:
                        conn.modify(g_dn, {'member': [(MODIFY_DELETE, [user_dn])]})
                        print(f"➖ Removido do grupo: {g_cn}")

                # 4. Adicionar aos grupos novos
                for dept in target_depts:
                    g_cn = f"ZC_DEPT_{dept.replace(' ', '_')}"
                    if g_cn not in current_groups_cn:
                        g_dn = ADService.ensure_group_exists(dept)
                        if g_dn:
                            conn.modify(g_dn, {'member': [(MODIFY_ADD, [user_dn])]})
                            print(f"➕ Adicionado ao grupo: {g_cn}")
                            
        except Exception as e:
            print(f"❌ Erro na sincronização de grupos: {e}")

    @staticmethod
    def list_all_users() -> List[Dict]:
        try:
            with ADService._get_conn() as conn:
                search_filter = "(&(objectCategory=person)(objectClass=user)(sAMAccountType=805306368))"
                conn.search(AD_BASE_DN, search_filter, attributes=['sAMAccountName', 'displayName', 'mail', 'department', 'title', 'userAccountControl', 'memberOf'])
                
                users = []
                for e in conn.entries:
                    uac = int(e.userAccountControl.value) if e.userAccountControl else 512
                    groups = [str(g).split(',')[0].split('=')[1].upper() for g in e.memberOf] if 'memberOf' in e else []
                    
                    # Filtra apenas grupos ZC_DEPT_ e limpa o nome
                    zc_depts = [ADService._normalize_dept(g) for g in groups if g.startswith("ZC_DEPT_")]
                    
                    # Define o principal
                    attr_dept = ADService._normalize_dept(str(e.department)) if e.department else None
                    primary = attr_dept if attr_dept and attr_dept != "GERAL" else (zc_depts[0] if zc_depts else "GERAL")

                    users.append({
                        "username": str(e.sAMAccountName).lower(),
                        "full_name": str(e.displayName) if e.displayName else str(e.sAMAccountName),
                        "email": str(e.mail) if e.mail else None,
                        "depts": list(set(zc_depts + [primary])),
                        "primary_dept": primary,
                        "title": str(e.title).upper() if e.title else "COLABORADOR",
                        "is_active": not (uac & 2)
                    })
                return users
        except Exception as e:
            print(f"Erro list_all: {e}")
            return []

    @staticmethod
    def authenticate(username: str, password: str) -> Optional[Dict]:
        user_dn = f"{username}@{AD_DOMAIN}"
        try:
            server = Server(AD_SERVER, get_info=ALL)
            with Connection(server, user=user_dn, password=password, auto_bind=True) as conn:
                conn.search(AD_BASE_DN, f"(sAMAccountName={username})", attributes=['displayName', 'mail', 'memberOf', 'title', 'department', 'userAccountControl'])
                if not conn.entries: return None
                u = conn.entries[0]
                groups = [str(g).split(',')[0].split('=')[1].upper() for g in u.memberOf] if 'memberOf' in u else []
                zc_depts = [ADService._normalize_dept(g) for g in groups if g.startswith("ZC_DEPT_")]
                
                attr_dept = ADService._normalize_dept(str(u.department)) if u.department else None
                primary = attr_dept if attr_dept and attr_dept != "GERAL" else (zc_depts[0] if zc_depts else "GERAL")
                
                all_depts = list(set(zc_depts + [primary]))
                return {
                    "username": username.lower(),
                    "full_name": str(u.displayName),
                    "email": str(u.mail[0]) if u.mail else None,
                    "role": ADService._resolve_role(groups),
                    "depts": all_depts,
                    "permissions": ADService._resolve_permissions(groups, all_depts),
                    "title": str(u.title).upper() if u.title else "COLABORADOR",
                    "is_active": not (int(u.userAccountControl.value) & 2)
                }
        except Exception: return None

    @staticmethod
    def list_all_departments() -> List[str]:
        """Retorna apenas setores que já possuem grupos ZC no AD."""
        try:
            with ADService._get_conn() as conn:
                conn.search(AD_BASE_DN, "(&(objectClass=group)(cn=ZC_DEPT_*))", attributes=['cn'])
                depts = [ADService._normalize_dept(str(e.cn)) for e in conn.entries]
                return sorted(list(set(depts + ["GERAL", "DIRETORIA", "TI", "RH"])))
        except Exception: return ["GERAL"]

    @staticmethod
    def _resolve_role(groups: List[str]) -> str:
        if any(g in groups for g in ["ZC_ROLE_ADMIN", "DOMAIN ADMINS"]): return "admin"
        if "ZC_ROLE_DIRETORIA" in groups: return "diretoria"
        if "ZC_ROLE_COORDENADOR" in groups: return "coordenador"
        if "ZC_ROLE_SUPERVISOR" in groups: return "supervisor"
        return "user"

    @staticmethod
    def _resolve_permissions(groups: List[str], depts: List[str]) -> List[str]:
        p = []
        low_depts = [d.lower() for d in depts]
        if any(d in low_depts for d in ["rh", "ti", "marketing", "comunicação"]) or "ZC_PERM_COMMS" in groups:
            p.append("post_general")
        if "ti" in low_depts or "ZC_PERM_TECH" in groups:
            p.append("post_tech")
        return p