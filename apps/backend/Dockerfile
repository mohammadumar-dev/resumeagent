# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

COPY src/ src/
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=build /workspace/target/*-SNAPSHOT.jar /app/app.jar

USER app
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
