-- fecha de evento
CREATE INDEX idx_fecha_evento ON evento(fecha_hora);

-- estado del evento
CREATE INDEX idx_estado_evento ON evento(id_estado);

-- participantes de un evento
CREATE INDEX idx_asiste_evento ON asiste(id_evento);

-- eventos de un participante
CREATE INDEX idx_asiste_participante ON asiste(id_participante);

-- usuarios
CREATE INDEX idx_usuarios_login ON login(usuario);