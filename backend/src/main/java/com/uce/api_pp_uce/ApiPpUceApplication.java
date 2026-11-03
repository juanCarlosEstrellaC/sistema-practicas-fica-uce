package com.uce.api_pp_uce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class ApiPpUceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiPpUceApplication.class, args);
		System.out.println("======================================================");
		System.out.println(" 		               	!Listo!                          ");
		System.out.println("======================================================");
	}

}
