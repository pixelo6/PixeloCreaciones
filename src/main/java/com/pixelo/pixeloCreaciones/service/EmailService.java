package com.pixelo.pixeloCreaciones.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.pixelo.pixeloCreaciones.model.Pedido;
import com.pixelo.pixeloCreaciones.model.DetallePedido;
import java.text.SimpleDateFormat;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarConfirmacion(Pedido pedido, String asunto) throws Exception {
        if (pedido == null) {
            System.err.println("DEBUG: Envío cancelado. El pedido es nulo.");
            return;
        }

        String destinatario = pedido.getCorreoInvitado();

        if (destinatario == null || destinatario.trim().isEmpty()) {
        System.out.println("Correo no disponible. Se cancela el envío de email para evitar caída del servidor.");
        return;
    }

        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
        String fechaFormateada = sdf.format(pedido.getFechaCreacion());

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(destinatario);
        helper.setSubject("Confirmación de tu compra Pixelo Creaciones - Orden #" + pedido.getBuyOrder());

        helper.addInline("logoPixelo", new ClassPathResource("static/img/logo.png"));

        StringBuilder htmlContent = new StringBuilder();
        htmlContent.append("<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        
        htmlContent.append("<div style='text-align: center; margin-bottom: 20px;'>");
        htmlContent.append("<img src='cid:logoPixelo' width='150px' alt='Pixelo Logo'/>");
        htmlContent.append("<h1>¡Gracias por tu compra!</h1>");
        htmlContent.append("</div>");

        htmlContent.append("<p>Hola, hemos recibido correctamente tu pedido <strong>#").append(pedido.getBuyOrder()).append("</strong>.</p>");
        htmlContent.append("<p>Fecha de compra: ").append(fechaFormateada).append("</p>");
        
        htmlContent.append("<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>");
        htmlContent.append("<tr style='background-color: #f8f9fa;'>");
        htmlContent.append("<th style='border: 1px solid #dee2e6; padding: 10px; text-align: left;'>Producto</th>");
        htmlContent.append("<th style='border: 1px solid #dee2e6; padding: 10px; text-align: right;'>Precio</th>");
        htmlContent.append("</tr>");

        if (pedido.getDetalles() != null) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                htmlContent.append("<tr>");
                htmlContent.append("<td style='border: 1px solid #dee2e6; padding: 10px;'>").append(detalle.getProducto().getNombre()).append("</td>");
                htmlContent.append("<td style='border: 1px solid #dee2e6; padding: 10px; text-align: right;'>$").append(detalle.getPrecioUnitario()).append("</td>");
                htmlContent.append("</tr>");
            }
        }
        htmlContent.append("</table>");
        
        htmlContent.append("<p style='font-size: 1.2em; text-align: right;'><strong>Total pagado: $").append(pedido.getTotal()).append("</strong></p>");
        htmlContent.append("<p style='text-align: center; font-size: 0.9em; color: #777;'>¡Esperamos que disfrutes tus productos de Pixelo Creaciones!</p>");
        htmlContent.append("</body></html>");

        helper.setText(htmlContent.toString(), true);
        mailSender.send(message);
    }
}