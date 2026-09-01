package com.aazdoh.common.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUser;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String cleanUrl = dbUrl;
        String user = dbUser;
        String password = dbPassword;

        // Auto-normalize cloud provider connection strings (Render, Heroku, Supabase, Neon)
        if (cleanUrl != null && (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://") || (cleanUrl.contains("://") && !cleanUrl.startsWith("jdbc:")))) {
            try {
                URI uri = new URI(cleanUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    user = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }

                cleanUrl = String.format("jdbc:postgresql://%s:%d%s%s",
                        host,
                        port,
                        path,
                        (query != null && !query.isBlank()) ? "?" + query : "");
                log.info("Normalized cloud database URL to JDBC format for host: {}", host);
            } catch (Exception e) {
                log.warn("Could not parse database URI as RFC 2396, attempting jdbc: prefix fallback: {}", e.getMessage());
                if (!cleanUrl.startsWith("jdbc:")) {
                    cleanUrl = "jdbc:" + cleanUrl;
                }
            }
        }

        config.setJdbcUrl(cleanUrl);
        if (user != null && !user.isBlank()) {
            config.setUsername(user);
        }
        if (password != null && !password.isBlank()) {
            config.setPassword(password);
        }
        config.setDriverClassName("org.postgresql.Driver");

        return new HikariDataSource(config);
    }
}
