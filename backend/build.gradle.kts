
plugins {

	java
	id("org.springframework.boot") version "4.0.5"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.uce"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.hibernate.orm:hibernate-envers")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
	implementation("org.springframework.boot:spring-boot-starter-mail")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("com.openhtmltopdf:openhtmltopdf-core:1.0.10")
	implementation("com.openhtmltopdf:openhtmltopdf-pdfbox:1.0.10")
	implementation("org.mindrot:jbcrypt:0.4")
	implementation("org.apache.poi:poi-ooxml:5.2.3")
	implementation("io.jsonwebtoken:jjwt-api:0.12.5")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")
	implementation("org.mapstruct:mapstruct:1.6.3")
	compileOnly("org.projectlombok:lombok")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	runtimeOnly("org.postgresql:postgresql")
	annotationProcessor("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")
	annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testCompileOnly("org.projectlombok:lombok")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
	testRuntimeOnly("com.h2database:h2")
	testAnnotationProcessor("org.projectlombok:lombok")
	testAnnotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")
}


tasks.withType<Test> {
	useJUnitPlatform()
	testLogging {
		events("failed", "standardError", "standardOut")
		showExceptions = true
		showCauses = true
		showStackTraces = true
	}
}

tasks.withType<JavaCompile> {
	options.encoding = "UTF-8"
}

tasks.withType<org.springframework.boot.gradle.tasks.run.BootRun> {
	jvmArgs = listOf("-Dfile.encoding=UTF-8", "-Dconsole.encoding=UTF-8")
}
