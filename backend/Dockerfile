# ==========================================
# Etapa 1: Compilación (Build Stage)
# ==========================================
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Copiar archivos de Gradle para aprovechar la caché de capas de Docker
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle.kts settings.gradle.kts ./

# Normalizar saltos de línea (CRLF a LF de Linux) y dar permisos de ejecución
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Descargar dependencias en caché
RUN ./gradlew dependencies --no-daemon

# Copiar código fuente
COPY src/ src/

# Compilar empaquetando el bootJar (omitiendo tests para construcción rápida)
RUN ./gradlew bootJar -x test --no-daemon && \
    find build/libs -name "*.jar" ! -name "*-plain.jar" -exec cp {} app.jar \;

# ==========================================
# Etapa 2: Imagen de Ejecución Ligera (Runtime)
# ==========================================
FROM eclipse-temurin:25-jre
WORKDIR /app

# Crear usuario y grupo de sistema sin privilegios root
RUN groupadd -r spring && useradd -r -g spring spring

# Crear directorio de evidencias con permisos adecuados
RUN mkdir -p /app/archivos_subidos && chown -R spring:spring /app

USER spring:spring

# Copiar el ejecutable jar generado
COPY --from=builder /app/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Dfile.encoding=UTF-8", "-jar", "app.jar"]
