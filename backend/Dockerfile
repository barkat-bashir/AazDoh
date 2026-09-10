# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# 1. Copy only pom.xml and pre-fetch dependencies (Cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Copy source code after dependencies are cached
COPY src ./src

# 3. Build application using cached dependencies
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a non-privileged user to run the app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose default port
EXPOSE 8080

# Run Spring Boot app
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
