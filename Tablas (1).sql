-- Usuarios 
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    es_organizador BOOLEAN DEFAULT FALSE,
    organizacion VARCHAR(150),
    usuario VARCHAR(100) UNIQUE,
    password_hash TEXT,
    rol VARCHAR(20) DEFAULT 'participante',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evento 
CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    organizador_id INT NOT NULL REFERENCES usuarios(id_usuario),
    nombre_evento VARCHAR(150) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    lugar VARCHAR(150),
    descripcion_corta VARCHAR(255),
    descripcion_larga TEXT,
    cupos INT CHECK (cupos >= 0),
    cupos_disponibles INT CHECK (cupos_disponibles >= 0),
    costo NUMERIC(10,2) DEFAULT 0,
    invitado VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'activo',
    tipo_evento VARCHAR(50) DEFAULT 'general',
    imagen_url VARCHAR(255),
    organizador_nombre VARCHAR(100),
    total_participantes INT DEFAULT 0,
    total_recaudado NUMERIC(12,2) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participante
CREATE TABLE participante (
    id_participante SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id_usuario),
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(150) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asiste
CREATE TABLE asiste (
    evento_id INT REFERENCES evento(id_evento),
    participante_id INT REFERENCES participante(id_participante),
    estado_participacion VARCHAR(20) DEFAULT 'confirmado',
    pago NUMERIC(10,2) DEFAULT 0,
    metodo_pago VARCHAR(50),
    participante_nombre VARCHAR(100),
    participante_correo VARCHAR(150),
    evento_nombre VARCHAR(150),
    evento_fecha TIMESTAMP,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (evento_id, participante_id)
);
