package com.pixelo.pixeloCreaciones.controller;

import com.pixelo.pixeloCreaciones.model.Pedido;
import com.pixelo.pixeloCreaciones.repository.PedidoRepository;
import com.pixelo.pixeloCreaciones.repository.ProductoRepository;
import com.pixelo.pixeloCreaciones.service.EmailService;
import com.pixelo.pixeloCreaciones.service.PedidoService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import com.pixelo.pixeloCreaciones.dto.PedidoRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

@RestController
@RequestMapping("/api/v1/transbank/transaction")
@CrossOrigin(origins = "*")
public class TransbankController {

    private final PedidoRepository pedidoRepository;
    private final EmailService emailService;
    private final ProductoRepository productoRepository;
    private final PedidoService pedidoService;

    public TransbankController(PedidoRepository pedidoRepository, 
                               EmailService emailService, 
                               ProductoRepository productoRepository,
                               PedidoService pedidoService) {
        this.pedidoRepository = pedidoRepository;
        this.emailService = emailService;
        this.productoRepository = productoRepository;
        this.pedidoService = pedidoService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> request, HttpServletRequest servletRequest) {
        String url = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Tbk-Api-Key-Id", "597055555532");
        headers.set("Tbk-Api-Key-Secret", "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C");
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            String buyOrder = request.containsKey("buy_order") ? (String) request.get("buy_order") : (String) request.get("buyOrder");
            String sessionId = request.containsKey("session_id") ? (String) request.get("session_id") : (String) request.get("sessionId");
            String returnUrl = request.containsKey("return_url") ? (String) request.get("return_url") : (String) request.get("returnUrl");
            Object amount = request.get("amount");

            if (buyOrder == null || buyOrder.trim().isEmpty()) {
                buyOrder = "PIX-" + System.currentTimeMillis();
            }
            if (sessionId == null || sessionId.trim().isEmpty()) {
                sessionId = "SES-" + System.currentTimeMillis();
            }
            
            if (returnUrl == null || returnUrl.trim().isEmpty()) {
                String esquema = servletRequest.getScheme();      
                String servidor = servletRequest.getServerName();  
                int puerto = servletRequest.getServerPort();      

                if (puerto == 80 || puerto == 443) {
                    returnUrl = esquema + "://" + servidor + "/api/v1/transbank/transaction/commit";
                } else {
                    returnUrl = esquema + "://" + servidor + ":" + puerto + "/api/v1/transbank/transaction/commit";
                }
            }

            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            PedidoRequestDTO dto = mapper.convertValue(request, PedidoRequestDTO.class);
            
            pedidoService.registrarPedido(dto, buyOrder);

            Map<String, Object> transbankRequest = new HashMap<>();
            transbankRequest.put("buy_order", buyOrder);
            transbankRequest.put("session_id", sessionId);
            transbankRequest.put("amount", amount);
            transbankRequest.put("return_url", returnUrl);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(transbankRequest, headers);
            ResponseEntity<Map> resp = new RestTemplate().postForEntity(url, entity, Map.class);
            
            return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", "Error interno al iniciar el pago: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/commit")
    public ResponseEntity<?> confirmarTransaccion(@RequestParam("token_ws") String token) {
        String url = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/" + token;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Tbk-Api-Key-Id", "597055555532");
        headers.set("Tbk-Api-Key-Secret", "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C");
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        try {
            ResponseEntity<Map> resp = new RestTemplate().exchange(url, HttpMethod.PUT, new HttpEntity<>(headers), Map.class);
            Map<String, Object> body = resp.getBody();
            
            if (body != null && body.containsKey("buy_order") && "AUTHORIZED".equals(body.get("status"))) {
                String buyOrder = (String) body.get("buy_order");
                
                Pedido pedidoPagado = pedidoService.confirmarPagoYDescontarStock(buyOrder);
                
                if (pedidoPagado != null && "PAGADO".equals(pedidoPagado.getEstado())) {
                    try {
                        emailService.enviarConfirmacion(pedidoPagado, "Compra exitosa");
                    } catch (Exception mailEx) {
                        System.out.println("No se pudo enviar el correo, pero el pago y stock se procesaron.");
                        mailEx.printStackTrace();
                    }
                    
                    return ResponseEntity.status(HttpStatus.FOUND).header("Location", "/resultado-pago.html?pago=exito").build();
                }
            } else {
                return ResponseEntity.status(HttpStatus.FOUND).header("Location", "/resultado-pago.html?pago=rechazado").build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", "/index.html?error=conexion").build();
        }
        
        return ResponseEntity.badRequest().build();
    }
}