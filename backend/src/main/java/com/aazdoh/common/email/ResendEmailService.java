package com.aazdoh.common.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class ResendEmailService {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestClient restClient;

    @Value("${aazdoh.resend.api-key:}")
    private String apiKey;

    @Value("${aazdoh.resend.from-email:AazDoh <onboarding@resend.dev>}")
    private String fromEmail;

    @Value("${aazdoh.app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public ResendEmailService() {
        this.restClient = RestClient.builder().build();
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String rawToken) {
        String resetUrl = frontendUrl + "/?reset-token=" + rawToken;

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.info("==================================================================");
            log.info("📧 [RESEND EMAIL - LOCAL FALLBACK] No RESEND_API_KEY configured.");
            log.info("Recipient: {} ({})", fullName, toEmail);
            log.info("Password Reset Link: {}", resetUrl);
            log.info("==================================================================");
            return;
        }

        String htmlContent = buildResetPasswordHtml(fullName, resetUrl);

        try {
            Map<String, Object> requestBody = Map.of(
                    "from", fromEmail,
                    "to", List.of(toEmail),
                    "subject", "Reset Your AazDoh Password",
                    "html", htmlContent
            );

            restClient.post()
                    .uri(RESEND_API_URL)
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Password reset email sent successfully via Resend to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email via Resend to {}: {}", toEmail, e.getMessage());
            log.info("Fallback Reset Link for {}: {}", toEmail, resetUrl);
        }
    }

    private String buildResetPasswordHtml(String fullName, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your AazDoh Password</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #120E0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5EFEB;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="min-height: 100vh;">
                <tr>
                  <td align="center" style="padding: 40px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 520px; background-color: #1E1712; border: 1px solid rgba(192, 83, 48, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                      
                      <!-- Header Accent -->
                      <tr>
                        <td style="background: linear-gradient(90deg, #C05330, #E2953B); height: 4px;"></td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 36px 32px;">
                          <!-- Logo/Brand -->
                          <div style="display: inline-block; margin-bottom: 24px;">
                            <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #FAF7F2;">Aaz<span style="color: #E2953B;">Doh</span></span>
                            <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #C05330; font-weight: 700; margin-top: 2px;">Accountability Engine</span>
                          </div>

                          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #FAF7F2;">Password Reset Request</h1>
                          
                          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #C4B5A5;">
                            Salaam <strong>%s</strong>,
                          </p>
                          
                          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #C4B5A5;">
                            We received a request to reset your AazDoh account password. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
                          </p>

                          <!-- Action Button -->
                          <div style="margin: 32px 0; text-align: center;">
                            <a href="%s" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C05330, #8A3016); color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 6px; box-shadow: 0 4px 14px rgba(192, 83, 48, 0.4);">
                              Reset Password
                            </a>
                          </div>

                          <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.6; color: #8C7B70;">
                            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                          </p>
                          
                          <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 28px 0 20px 0;" />
                          
                          <p style="margin: 0; font-size: 11px; color: #8C7B70; line-height: 1.5; word-break: break-all;">
                            Button not working? Copy and paste this link into your browser:<br />
                            <a href="%s" style="color: #E2953B; text-decoration: underline;">%s</a>
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #16100D; padding: 16px 32px; text-align: center; font-size: 11px; color: #6E5F55;">
                          AazDoh • Modern Kashmiri Accountability Platform
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(fullName, resetUrl, resetUrl, resetUrl);
    }
}
