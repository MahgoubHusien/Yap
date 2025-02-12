package com.example.yap.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

public class EnvLoader {

    public static void loadEnvFile(String filePath) {
        try (Stream<String> lines = Files.lines(Paths.get(filePath))) {
            lines.forEach(line -> {
                // Skip comments and empty lines
                if (line.startsWith("#") || line.trim().isEmpty()) {
                    return;
                }
                String[] keyValue = line.split("=", 2);
                if (keyValue.length == 2) {
                    System.setProperty(keyValue[0].trim(), keyValue[1].trim());
                }
            });
        } catch (IOException e) {
            throw new RuntimeException("Could not load .env file: " + filePath, e);
        }
    }
}
