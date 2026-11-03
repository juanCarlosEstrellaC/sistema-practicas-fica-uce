package com.uce.api_pp_uce.services;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
public class PdfService {

    private final TemplateEngine templateEngine;

    public PdfService(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generatePdfFromHtml(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);

        try {
            Resource resource = new ClassPathResource("static/logoUCE.png");
            if (resource.exists()) {
                byte[] imageBytes = resource.getInputStream().readAllBytes();
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                context.setVariable("logoBase64", "data:image/png;base64," + base64Image);
            }
            
            Resource resourceVcs = new ClassPathResource("static/vcs_recorte.png");
            if (resourceVcs.exists()) {
                byte[] imageBytesVcs = resourceVcs.getInputStream().readAllBytes();
                String base64ImageVcs = Base64.getEncoder().encodeToString(imageBytesVcs);
                context.setVariable("vcsBase64", "data:image/png;base64," + base64ImageVcs);
            }
        } catch(Exception e) {
            log.warn("No se pudo cargar una de las imagenes: {}", e.getMessage());
        }

        String html = templateEngine.process(templateName, context);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            String baseUri = getClass().getResource("/static/") != null
                    ? getClass().getResource("/static/").toExternalForm()
                    : "http://localhost";
            builder.withHtmlContent(html, baseUri);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        }
    }
}
