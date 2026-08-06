package com.vireocode.build;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.TaskAction;

/**
 * Rewrites the committed snapshot to match the current public API.
 */
public abstract class ApiSurfaceUpdateTask extends AbstractApiSurfaceTask {

    @OutputFile
    public abstract RegularFileProperty getSurfaceFile();

    @TaskAction
    public void update() throws IOException {
        File file = getSurfaceFile().get().getAsFile();
        Files.createDirectories(file.toPath().getParent());
        Files.writeString(file.toPath(),
                String.join("\n", renderSurface()).stripTrailing() + "\n", StandardCharsets.UTF_8);
        getLogger().lifecycle("Wrote {}", file);
    }
}
