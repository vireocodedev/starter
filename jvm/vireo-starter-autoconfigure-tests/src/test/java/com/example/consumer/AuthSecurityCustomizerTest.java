package com.example.consumer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.auth.StarterHttpSecurityCustomizer;

@SpringBootTest(classes = { ConsumerApplication.class, AuthSecurityCustomizerTest.Configuration.class })
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthSecurityCustomizerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void customizerCanPublishANarrowPublicApiRoute() throws Exception {
        mockMvc.perform(get("/api/public-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("public"));
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Configuration {

        @Bean
        StarterHttpSecurityCustomizer publicRouteCustomizer() {
            return http -> http.authorizeHttpRequests(
                    authorization -> authorization.requestMatchers("/api/public-test").permitAll());
        }

        @Bean
        PublicTestController publicTestController() {
            return new PublicTestController();
        }
    }

    @RestController
    static class PublicTestController {

        @GetMapping("/api/public-test")
        String publicRoute() {
            return "public";
        }
    }
}
