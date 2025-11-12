-- Organizador
CREATE TABLE organizador (
    id_organizador SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    organizacion VARCHAR(150)
);

-- Estado evento
CREATE TABLE estado_evento (
    id SERIAL PRIMARY KEY,
    estado VARCHAR(50) UNIQUE NOT NULL
);

-- Tipo de evento
CREATE TABLE tipo_evento(
	id SERIAL PRIMARY KEY,
	tipo VARCHAR(255) UNIQUE NOT NULL
);

-- Evento
CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    id_organizador INT NOT NULL REFERENCES organizador(id_organizador) ON DELETE CASCADE,
    nombre_evento VARCHAR(150) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    lugar VARCHAR(150),
    descripcion_corta VARCHAR(255),
    descripcion_larga TEXT,
    cupos INT CHECK (cupos >= 0),
    costo NUMERIC(10,2) DEFAULT 0,
    invitado VARCHAR(100),
    id_estado INT REFERENCES estado_evento(id) ON DELETE SET NULL,
	id_tipo INT REFERENCES tipo_evento(id) ON DELETE SET NULL,
    imagen_url VARCHAR(255) 
	-- imagen_url es para agregar imagenes (posters o asi)
	-- asi sera mas facil en caso de que quieran agregar imagenes
);

-- Participante
CREATE TABLE participante (
    id_participante SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(150) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estado participacion 
CREATE TABLE estado_participacion (
	id SERIAL PRIMARY KEY,
	estado varchar(255) UNIQUE NOT NULL
);

-- Asiste (relación evento:participante)
CREATE TABLE asiste (
    id_evento INT REFERENCES evento(id_evento) ON DELETE CASCADE,
    id_participante INT REFERENCES participante(id_participante) ON DELETE CASCADE,
    id_estado_participacion INT REFERENCES estado_participacion(id) ON DELETE CASCADE,
	pago NUMERIC(10,2) DEFAULT 0,
    PRIMARY KEY (id_evento, id_participante)
);

-- Login tipo usuario
CREATE TABLE tipo_usuario (
	id_rol SERIAL PRIMARY KEY,
	nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Login
CREATE TABLE login (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
	correo VARCHAR(100),
    password_hash TEXT NOT NULL,
	id_rol INT REFERENCES tipo_usuario(id_rol)
);