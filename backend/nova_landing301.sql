-- Match landing clearance with the client; retain auth, ownership and army checks.
do $landing301$
declare def text; old_rule text:='sqrt(power((b->>''x'')::numeric-xx,2)+power((b->>''y'')::numeric-yy,2))<1.3';
new_rule text:='sqrt(power((b->>''x'')::numeric-xx,2)+power((b->>''y'')::numeric-yy,2))<0.8';
begin
def:=pg_get_functiondef('nova_private.siege_command(jsonb)'::regprocedure);
if position(new_rule in def)>0 then return;end if;
if position(old_rule in def)=0 then raise exception 'Landing validation changed; inspect before updating';end if;
execute replace(def,old_rule,new_rule);
end $landing301$;